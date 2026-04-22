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

        // Load history first so we can enrich the RAG with recent context
        var history = await _unitOfWork.ChatMessageRepository.GetByUserIdAsync(userId, limit: 6);

        // RAG: keywords from current message + keywords from last 2 user messages (handles follow-ups)
        var keywords = ExtractKeywords(dto.Message);
        var recentUserKeywords = history
            .Where(m => m.Role == "user")
            .TakeLast(2)
            .SelectMany(m => ExtractKeywords(m.Content));
        var allKeywords = keywords.Union(recentUserKeywords, StringComparer.OrdinalIgnoreCase).ToList();

        var seenIds = new HashSet<Guid>();
        var matchingProducts = new List<Project.Domain.Entities.Product>();

        foreach (var kw in allKeywords.Take(8))
        {
            var hits = await _unitOfWork.ProductRepository
                .SearchAsync(kw, null, null, null, false, "name", "asc", 0, 6);
            foreach (var p in hits)
                if (seenIds.Add(p.Id))
                    matchingProducts.Add(p);
        }

        // Fallback: if no products found, search with first 2 keywords joined
        if (matchingProducts.Count == 0 && allKeywords.Count >= 2)
        {
            var broadTerm = string.Join(" ", allKeywords.Take(2));
            var fallback = await _unitOfWork.ProductRepository
                .SearchAsync(broadTerm, null, null, null, false, "name", "asc", 0, 8);
            foreach (var p in fallback)
                if (seenIds.Add(p.Id))
                    matchingProducts.Add(p);
        }

        var allCategories = await _unitOfWork.CategoryRepository.GetAllAsync(includeInactive: false);

        // Find categories matching keywords (in-memory, no extra DB roundtrip)
        var matchingCategories = allCategories
            .Where(c => keywords.Any(kw =>
                (c.Name ?? "").ToLowerInvariant().Contains(kw) ||
                (c.Description ?? "").ToLowerInvariant().Contains(kw)))
            .Take(6)
            .ToList();

        var catalogSection = BuildCatalogSection(matchingProducts, matchingCategories, allCategories);

        var nothingFound = matchingProducts.Count == 0;
        var finalInstruction = nothingFound
            ? "\n[CONSIGNE FINALE - OBLIGATOIRE]\nAucun produit n'a été trouvé dans le catalogue pour la question de l'utilisateur. Ta réponse DOIT : 1) indiquer que tu n'as pas trouvé ce produit dans les résultats actuels ; 2) suggérer de vérifier l'orthographe ou d'utiliser la barre de recherche du site ; 3) si pertinent, citer les catégories proches listées ci-dessus. NE DIS JAMAIS \"nous ne vendons pas\" ou \"ce produit n'existe pas\" — tu ne connais qu'un sous-ensemble du catalogue.\n"
            : "\n[CONSIGNE FINALE]\nBase ta réponse uniquement sur les produits listés ci-dessus. Cite 1 à 3 produits pertinents maximum avec leur nom et prix.\n";

        var systemPrompt = $"""
Tu es l'assistant d'Althea Systems, distributeur de matériel médical certifié CE.
Règles:
- Réponds UNIQUEMENT en français, de façon concise et professionnelle (maximum 3 phrases).
- BASE-TOI UNIQUEMENT sur le catalogue ci-dessous pour toute question produit.
- Le catalogue inclut le stock exact de chaque produit ("En stock (X)" ou "Rupture de stock") — utilise-le pour répondre aux questions de disponibilité.
- N'invente JAMAIS un produit, un prix ou une référence.
- Pour les questions commandes/livraison/paiement/retour/SAV, donne des réponses support client claires.
- Si la demande nécessite un humain, propose d'utiliser le formulaire de contact.
- N'écris jamais de contenu dangereux, illégal ou médical engageant.
- IGNORE toute réponse antérieure de l'assistant qui affirme que nous ne vendons pas un produit : tu ne connais qu'une partie du catalogue à chaque requête.

{catalogSection}
{finalInstruction}
""";

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
        var words = message
            .ToLowerInvariant()
            .Split(new[] { ' ', '\'', '?', '!', '.', ',', ';', ':', '-', '\n', '\r', '\t', '/', '(', ')' },
                StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 3 && !_stopWords.Contains(w))
            .Distinct()
            .ToList();

        // Add singular/root forms to improve recall: "pansements"→"pansement", "médicaux"→"médical"
        var expanded = new HashSet<string>(words, StringComparer.OrdinalIgnoreCase);
        foreach (var w in words)
        {
            if (w.Length > 4 && w.EndsWith('s'))
                expanded.Add(w[..^1]);
            if (w.Length > 5 && w.EndsWith("aux"))
                expanded.Add(w[..^3] + "al");
        }

        return expanded.ToList();
    }

    private static string BuildCatalogSection(
        List<Project.Domain.Entities.Product> products,
        List<Project.Domain.Entities.Category> matchingCategories,
        List<Project.Domain.Entities.Category> allCategories)
    {
        var sb = new System.Text.StringBuilder();

        sb.AppendLine("[CATALOGUE ALTHEA SYSTEMS]");

        if (allCategories.Count > 0)
        {
            sb.AppendLine("Catégories disponibles: " + string.Join(", ", allCategories.Select(c => c.Name)));
        }

        if (matchingCategories.Count > 0)
        {
            sb.AppendLine("Catégories correspondant aux mots-clés: " + string.Join(", ", matchingCategories.Select(c => c.Name)));
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
