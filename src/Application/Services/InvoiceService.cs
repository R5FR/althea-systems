namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Enums;
using Project.Domain.Exceptions;

public class InvoiceService : IInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public InvoiceService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<InvoiceDto> GenerateInvoiceAsync(Guid orderId)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("OrderId cannot be empty", nameof(orderId));

        var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId)
            ?? throw new NotFoundException($"Order '{orderId}' not found");

        var existing = await _unitOfWork.InvoiceRepository.GetByOrderIdAsync(orderId);
        if (existing != null)
            return _mapper.Map<InvoiceDto>(existing);

        var invoiceNumber = await GenerateInvoiceNumberAsync();

        var invoice = new Invoice(
            Guid.NewGuid(),
            invoiceNumber,
            order,
            order.User,
            order.TotalTtc,
            string.Empty);

        await _unitOfWork.InvoiceRepository.AddAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<InvoiceDto?> GetInvoiceByOrderIdAsync(Guid orderId, Guid callerUserId)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("OrderId cannot be empty", nameof(orderId));
        if (callerUserId == Guid.Empty) throw new ArgumentException("CallerUserId cannot be empty", nameof(callerUserId));

        var caller = await _unitOfWork.UserRepository.GetByIdAsync(callerUserId);
        var isAdmin = caller?.Role == Project.Domain.Enums.Role.Admin;

        var invoice = await _unitOfWork.InvoiceRepository.GetByOrderIdAsync(orderId);
        if (invoice == null)
        {
            // Auto-generate for paid orders so users can download retroactively
            var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);
            if (order == null) return null;

            var isOrderOwner = order.User?.Id == callerUserId;
            if (!isOrderOwner && !isAdmin)
                throw new UnauthorizedException("Access denied");

            var invoiceNumber = await GenerateInvoiceNumberAsync();
            invoice = new Invoice(Guid.NewGuid(), invoiceNumber, order, order.User, order.TotalTtc, string.Empty);
            await _unitOfWork.InvoiceRepository.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<InvoiceDto>(invoice);
        }

        var isOwner = invoice.User?.Id == callerUserId;
        if (!isOwner && !isAdmin)
            throw new UnauthorizedException("Access denied");

        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<InvoiceDto> GetInvoiceAsync(Guid invoiceId, Guid callerUserId)
    {
        if (invoiceId == Guid.Empty) throw new ArgumentException("InvoiceId cannot be empty", nameof(invoiceId));
        if (callerUserId == Guid.Empty) throw new ArgumentException("CallerUserId cannot be empty", nameof(callerUserId));

        var invoice = await _unitOfWork.InvoiceRepository.GetByIdAsync(invoiceId)
            ?? throw new NotFoundException($"Invoice '{invoiceId}' not found");

        var isOwner = invoice.User?.Id == callerUserId;
        var caller = await _unitOfWork.UserRepository.GetByIdAsync(callerUserId);
        var isAdmin = caller?.Role == Project.Domain.Enums.Role.Admin;

        if (!isOwner && !isAdmin)
            throw new UnauthorizedException("Access denied");

        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<List<InvoiceDto>> GetUserInvoicesAsync(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));

        var invoices = await _unitOfWork.InvoiceRepository.GetByUserIdAsync(userId);
        return _mapper.Map<List<InvoiceDto>>(invoices);
    }

    public async Task<List<InvoiceDto>> GetAllInvoicesAsync()
    {
        var invoices = await _unitOfWork.InvoiceRepository.GetAllAsync();
        return _mapper.Map<List<InvoiceDto>>(invoices);
    }

    public async Task UpdateInvoiceStatusAsync(Guid invoiceId, string status)
    {
        if (invoiceId == Guid.Empty) throw new ArgumentException("InvoiceId cannot be empty", nameof(invoiceId));
        if (string.IsNullOrWhiteSpace(status)) throw new ValidationException("Status is required");

        var invoice = await _unitOfWork.InvoiceRepository.GetByIdAsync(invoiceId)
            ?? throw new NotFoundException($"Invoice '{invoiceId}' not found");

        if (!Enum.TryParse<InvoiceStatus>(status, true, out var parsed))
            throw new ValidationException($"Invalid status: {status}");

        invoice.UpdateStatus(parsed);
        await _unitOfWork.InvoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _unitOfWork.InvoiceRepository.CountAsync();
        var seq = (count + 1).ToString("D6");
        return $"INV-{year}-{seq}";
    }
}
