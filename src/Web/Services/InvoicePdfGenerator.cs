namespace Web.Services;

using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Project.Domain.Entities;

public class InvoicePdfGenerator
{
    private const string Navy  = "#003D5C";
    private const string Teal  = "#00A8B5";
    private const string Cream = "#F0FAFB";
    private const string Gray  = "#6B7280";
    private const string Light = "#F9FAFB";

    static InvoicePdfGenerator()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] Generate(Invoice invoice, Order order)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginHorizontal(1.5f, Unit.Centimetre);
                page.MarginVertical(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(9).FontColor("#1F2937"));

                page.Header().Element(ComposeHeader(invoice, order));
                page.Content().PaddingTop(16).Element(ComposeContent(invoice, order));
                page.Footer().Element(ComposeFooter(invoice));
            });
        }).GeneratePdf();
    }

    private Action<IContainer> ComposeHeader(Invoice invoice, Order order) => container =>
    {
        container.Column(col =>
        {
            // Top bar: logo area + invoice metadata
            col.Item().Row(row =>
            {
                // Brand
                row.RelativeItem().Column(brand =>
                {
                    brand.Item()
                        .Background(Navy)
                        .Padding(12)
                        .Row(r =>
                        {
                            r.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Althea Systems")
                                    .FontColor("#FFFFFF")
                                    .FontSize(16)
                                    .Bold()
                                    .FontFamily("Arial");
                                c.Item().Text("Distributeur de matériel médical certifié CE")
                                    .FontColor("#93C5FD")
                                    .FontSize(7.5f);
                            });
                        });
                });

                // Invoice title + meta
                row.ConstantItem(180).Background(Teal).Padding(12).Column(meta =>
                {
                    meta.Item().Text("FACTURE")
                        .FontColor("#FFFFFF")
                        .FontSize(18)
                        .Bold();
                    meta.Item().PaddingTop(4).Text($"N° {invoice.InvoiceNumber}")
                        .FontColor("#FFFFFF")
                        .FontSize(8.5f);
                    meta.Item().Text($"Date : {invoice.IssuedAt:dd/MM/yyyy}")
                        .FontColor("#FFFFFF")
                        .FontSize(8.5f);
                    meta.Item().Text($"Commande : {order.OrderNumber}")
                        .FontColor("#FFFFFF")
                        .FontSize(8);
                });
            });

            col.Item().PaddingTop(12).Row(addresses =>
            {
                // Seller info
                addresses.RelativeItem().Border(0.5f).BorderColor("#E5E7EB").Padding(10).Column(seller =>
                {
                    seller.Item().Text("ÉMETTEUR").FontSize(7).FontColor(Teal).Bold().LetterSpacing(1f);
                    seller.Item().PaddingTop(4).Text("Althea Systems SAS").Bold();
                    seller.Item().Text("12 Avenue de la Médecine");
                    seller.Item().Text("75008 Paris, France");
                    seller.Item().Text("SIRET : 123 456 789 00012");
                    seller.Item().Text("TVA : FR12 123456789");
                    seller.Item().PaddingTop(2).Text("contact@althea-systems.com").FontColor(Teal);
                });

                addresses.ConstantItem(12);

                // Client info
                addresses.RelativeItem().Border(0.5f).BorderColor("#E5E7EB").Padding(10).Column(client =>
                {
                    client.Item().Text("DESTINATAIRE").FontSize(7).FontColor(Teal).Bold().LetterSpacing(1f);
                    client.Item().PaddingTop(4).Text($"{invoice.User?.FirstName} {invoice.User?.LastName}").Bold();
                    client.Item().Text(invoice.User?.Email?.Value ?? "");

                    var addr = order.BillingAddress ?? order.ShippingAddress;
                    if (addr != null)
                    {
                        client.Item().PaddingTop(2).Text(addr.AddressLine1);
                        if (!string.IsNullOrEmpty(addr.AddressLine2))
                            client.Item().Text(addr.AddressLine2);
                        client.Item().Text($"{addr.PostalCode} {addr.City}");
                        client.Item().Text(addr.Country);
                        if (!string.IsNullOrEmpty(addr.Phone))
                            client.Item().PaddingTop(2).Text(addr.Phone).FontColor(Gray);
                    }
                });
            });
        });
    };

    private Action<IContainer> ComposeContent(Invoice invoice, Order order) => container =>
    {
        container.Column(col =>
        {
            // Items table
            col.Item().PaddingTop(16).Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    cols.RelativeColumn(4);    // Désignation
                    cols.ConstantColumn(30);   // Qté
                    cols.ConstantColumn(60);   // P.U. HT
                    cols.ConstantColumn(40);   // TVA%
                    cols.ConstantColumn(65);   // Total HT
                    cols.ConstantColumn(70);   // Total TTC
                });

                // Header row
                table.Header(header =>
                {
                    static IContainer HeaderCell(IContainer c) =>
                        c.Background(Navy).Padding(8).AlignMiddle();

                    static TextSpanDescriptor HeaderText(IContainer c, string t) =>
                        c.Text(t).FontColor("#FFFFFF").FontSize(8).Bold();

                    HeaderText(HeaderCell(header.Cell()), "Désignation");
                    HeaderText(HeaderCell(header.Cell()).AlignCenter(), "Qté");
                    HeaderText(HeaderCell(header.Cell()).AlignRight(), "P.U. HT");
                    HeaderText(HeaderCell(header.Cell()).AlignCenter(), "TVA");
                    HeaderText(HeaderCell(header.Cell()).AlignRight(), "Total HT");
                    HeaderText(HeaderCell(header.Cell()).AlignRight(), "Total TTC");
                });

                // Item rows
                bool isEven = false;
                foreach (var item in order.Items)
                {
                    var bg = isEven ? Light : "#FFFFFF";
                    isEven = !isEven;

                    static IContainer ItemCell(IContainer c, string bg) =>
                        c.Background(bg).BorderBottom(0.5f).BorderColor("#F3F4F6").Padding(8).AlignMiddle();

                    ItemCell(table.Cell(), bg)
                        .Text(item.ProductNameSnapshot).Bold().FontSize(8.5f);

                    ItemCell(table.Cell(), bg).AlignCenter()
                        .Text(item.Quantity.ToString()).FontSize(8.5f);

                    ItemCell(table.Cell(), bg).AlignRight()
                        .Text($"{item.UnitPriceHt:N2} €").FontSize(8.5f);

                    ItemCell(table.Cell(), bg).AlignCenter()
                        .Text($"{item.UnitTvaRate:N0}%").FontSize(8.5f).FontColor(Gray);

                    var lineHt = item.UnitPriceHt * item.Quantity;
                    ItemCell(table.Cell(), bg).AlignRight()
                        .Text($"{lineHt:N2} €").FontSize(8.5f);

                    ItemCell(table.Cell(), bg).AlignRight()
                        .Text($"{item.TotalLineTtc:N2} €").Bold().FontSize(8.5f);
                }
            });

            // Totals
            col.Item().PaddingTop(12).AlignRight().Width(220).Table(totals =>
            {
                totals.ColumnsDefinition(cols =>
                {
                    cols.RelativeColumn();
                    cols.ConstantColumn(90);
                });

                void TotalRow(TableDescriptor t, string label, string val, bool bold = false, bool highlight = false)
                {
                    var bg      = highlight ? Teal      : "#FFFFFF";
                    var fg      = highlight ? "#FFFFFF"  : "#1F2937";
                    var fgLabel = highlight ? "#FFFFFF"  : Gray;

                    var labelText = t.Cell().Background(bg).PaddingHorizontal(10).PaddingVertical(5)
                        .Text(label).FontColor(fgLabel).FontSize(8);
                    if (bold) labelText.Bold();

                    var valText = t.Cell().Background(bg).PaddingHorizontal(10).PaddingVertical(5).AlignRight()
                        .Text(val).FontColor(fg).FontSize(8);
                    if (bold) valText.Bold();
                }

                TotalRow(totals, "Total HT", $"{order.TotalHt:N2} €");
                TotalRow(totals, "TVA", $"{order.TotalTva:N2} €");
                TotalRow(totals, "TOTAL TTC", $"{order.TotalTtc:N2} €", bold: true, highlight: true);
            });

            // Payment info
            col.Item().PaddingTop(20).Border(0.5f).BorderColor("#E5E7EB")
                .Background(Cream).Padding(12).Column(pay =>
                {
                    pay.Item().Text("CONDITIONS DE PAIEMENT")
                        .FontSize(7).FontColor(Teal).Bold().LetterSpacing(1f);
                    pay.Item().PaddingTop(4).Text("Paiement par carte bancaire sécurisée (Stripe). Facture acquittée à réception.")
                        .FontSize(8).FontColor(Gray);
                    pay.Item().PaddingTop(2)
                        .Text($"Statut : {(invoice.Status == Project.Domain.Enums.InvoiceStatus.Paid ? "PAYÉE" : "EN ATTENTE")}")
                        .FontSize(8)
                        .FontColor(invoice.Status == Project.Domain.Enums.InvoiceStatus.Paid ? "#059669" : "#D97706")
                        .Bold();
                });
        });
    };

    private Action<IContainer> ComposeFooter(Invoice invoice) => container =>
    {
        container.BorderTop(0.5f).BorderColor("#E5E7EB").PaddingTop(8).Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Text("Althea Systems SAS — Capital 50 000 € — RCS Paris 123 456 789")
                    .FontSize(7).FontColor(Gray);
                row.ConstantItem(150).AlignRight()
                    .Text($"Facture {invoice.InvoiceNumber} • Page 1/1")
                    .FontSize(7).FontColor(Gray);
            });
            col.Item().PaddingTop(2)
                .Text("Document émis électroniquement — valable sans signature selon l'article 289 du CGI")
                .FontSize(7).FontColor("#9CA3AF").Italic();
        });
    };
}
