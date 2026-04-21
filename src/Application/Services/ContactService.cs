namespace Application.Services;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

public class ContactService : IContactService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IChatbotClient _chatbotClient;

    public ContactService(IUnitOfWork unitOfWork, IChatbotClient chatbotClient)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _chatbotClient = chatbotClient ?? throw new ArgumentNullException(nameof(chatbotClient));
    }

    public async Task SubmitAsync(SubmitContactDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Email)) throw new ValidationException("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Subject)) throw new ValidationException("Subject is required");

        var message = new ContactMessage(
            Guid.NewGuid(),
            dto.Email,
            dto.Subject,
            dto.Message ?? string.Empty);

        await _unitOfWork.ContactRepository.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<ContactMessageDto>> GetAllAsync(bool unreadOnly = false)
    {
        var messages = await _unitOfWork.ContactRepository.GetAllAsync(unreadOnly);
        return messages.Select(m => MapToDto(m)).ToList();
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var message = await _unitOfWork.ContactRepository.GetByIdAsync(id);
        if (message == null)
            throw new NotFoundException($"Contact message with id '{id}' not found");

        message.MarkAsRead();
        await _unitOfWork.ContactRepository.UpdateAsync(message);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<int> GetUnreadCountAsync()
    {
        return await _unitOfWork.ContactRepository.GetUnreadCountAsync();
    }

    public async Task<ChatbotResponseDto> ChatAsync(ChatbotRequestDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Message)) throw new ValidationException("Message is required");
        if (userId == Guid.Empty) throw new ValidationException("UserId is required");

        // RAG: extract keywords then search catalog
        var keywords = ExtractKeywords(dto.Message);
        var seenIds = new HashSet<Guid>();
        var matchingProducts = new List<Project.Domain.Entities.Product>();

        foreach (var kw in keywords.Take(4))
        {
            var hits = await _unitOfWork.ProductRepository
                .SearchAsync(kw, null, null, null, false, "name", "asc", 0, 6);
            foreach (var p in hits)
                if (seenIds.Add(p.Id))
                    matchingProducts.Add(p);
        }

        var allCategories = await _unitOfWork.CategoryRepository.GetAllAsync(includeInactive: false);

        var catalogSection = BuildCatalogSection(matchingProducts, allCategories);

        var systemPrompt = $"""
Tu es l'assistant d'Althea Systems, distributeur de matériel médical certifié CE.
Règles:
- Réponds en français, de façon concise et professionnelle.
- Pour toute question sur les produits, BASE-TOI UNIQUEMENT sur le catalogue fourni ci-dessous. N'invente aucun produit.
- Si aucun produit correspondant n'est trouvé dans le catalogue, dis-le clairement.
- Pour les questions commandes/livraison/paiement/retour/SAV, donne des réponses support client claires.
- Si la demande nécessite un humain, propose d'utiliser le formulaire de contact.
- N'écris jamais de contenu dangereux, illégal ou médical engageant.

{catalogSection}
""";

        // Load conversation history (last 20 exchanges = 40 messages)
        var history = await _unitOfWork.ChatMessageRepository.GetByUserIdAsync(userId, limit: 40);
        var historyEntries = history
            .Select(m => new ChatHistoryEntry(m.Role, m.Content))
            .ToList();

        var reply = await _chatbotClient.GenerateReplyAsync(systemPrompt, historyEntries, dto.Message, cancellationToken);

        // Persist both sides of the exchange
        await _unitOfWork.ChatMessageRepository.AddAsync(new ChatMessage(Guid.NewGuid(), userId, "user", dto.Message));
        await _unitOfWork.ChatMessageRepository.AddAsync(new ChatMessage(Guid.NewGuid(), userId, "assistant", reply));
        await _unitOfWork.SaveChangesAsync();

        return new ChatbotResponseDto { Message = reply };
    }

    public async Task<List<ChatHistoryItemDto>> GetChatHistoryAsync(Guid userId, int limit = 50)
    {
        if (userId == Guid.Empty) throw new ValidationException("UserId is required");

        var messages = await _unitOfWork.ChatMessageRepository.GetByUserIdAsync(userId, limit);
        return messages.Select(m => new ChatHistoryItemDto
        {
            Role = m.Role,
            Content = m.Content,
            CreatedAt = m.CreatedAt
        }).ToList();
    }

    private static readonly HashSet<string> _stopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "avez","vous","des","de","du","le","la","les","un","une","est","sont",
        "que","qui","quoi","quel","quelle","dans","sur","pour","par","avec",
        "sans","et","ou","mais","nous","je","il","elle","ils","elles","on",
        "ce","se","moi","toi","lui","me","te","mon","ton","son","notre",
        "votre","leur","cette","cet","au","aux","en","si","ne","pas","plus",
        "très","bien","tout","tous","aussi","comme","quand","alors","donc",
        "vendez","avez","avons","avoir","être","faire","pouvez","puis","peut",
        "voulez","cherche","cherchez","besoin","besoin","souhait","voudrait",
        "bonjour","merci","svp","stp","please","hello","salut"
    };

    private static List<string> ExtractKeywords(string message)
    {
        return message
            .ToLowerInvariant()
            .Split(new[] { ' ', '\'', '?', '!', '.', ',', ';', ':', '-', '\n', '\r', '\t', '/', '(' ,')' },
                StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 4 && !_stopWords.Contains(w))
            .Distinct()
            .ToList();
    }

    private static string BuildCatalogSection(
        List<Project.Domain.Entities.Product> products,
        List<Project.Domain.Entities.Category> categories)
    {
        var sb = new System.Text.StringBuilder();

        sb.AppendLine("[CATALOGUE ALTHEA SYSTEMS]");

        if (categories.Count > 0)
        {
            sb.AppendLine("Catégories disponibles: " + string.Join(", ", categories.Select(c => c.Name)));
        }

        if (products.Count == 0)
        {
            sb.AppendLine("Aucun produit correspondant trouvé dans le catalogue pour cette question.");
        }
        else
        {
            sb.AppendLine($"Produits correspondants ({products.Count}):");
            foreach (var p in products)
            {
                var stock = p.StockQuantity > 0 ? $"En stock ({p.StockQuantity})" : "Rupture de stock";
                sb.AppendLine($"- {p.Name} | Réf: {p.Slug} | Prix TTC: {p.PriceTtc:F2}€ | Catégorie: {p.Category?.Name ?? "N/A"} | {stock}");
                if (!string.IsNullOrWhiteSpace(p.Description))
                {
                    var shortDesc = p.Description.Length > 120 ? p.Description[..120] + "…" : p.Description;
                    sb.AppendLine($"  Description: {shortDesc}");
                }
            }
        }

        return sb.ToString();
    }

    private static ContactMessageDto MapToDto(ContactMessage message)
    {
        return new ContactMessageDto
        {
            Id = message.Id,
            Email = message.Email,
            Subject = message.Subject,
            Message = message.Message,
            Status = message.Status.ToString(),
            CreatedAt = message.CreatedAt
        };
    }
}
