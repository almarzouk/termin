<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rechnung {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
            padding: 40px;
        }

        .header {
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }

        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .company-info {
            color: #666;
            font-size: 12px;
        }

        .invoice-header {
            margin-bottom: 40px;
            width: 100%;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            float: left;
            width: 50%;
        }

        .invoice-details {
            text-align: right;
            float: right;
            width: 50%;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }        .invoice-number {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .details-row {
            margin-bottom: 5px;
            font-size: 14px;
        }

        .label {
            font-weight: bold;
            color: #666;
        }

        .customer-info {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
        }

        .customer-title {
            font-size: 14px;
            font-weight: bold;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .customer-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        .items-table thead {
            background: #2563eb;
            color: white;
        }

        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }

        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }

        .items-table tr:last-child td {
            border-bottom: none;
        }

        .text-right {
            text-align: right;
        }

        .summary {
            width: 300px;
            margin-left: auto;
            margin-bottom: 40px;
        }

        .summary-row {
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .summary-row-label {
            float: left;
            width: 60%;
        }

        .summary-row-value {
            float: right;
            width: 40%;
            text-align: right;
        }        .summary-row.total {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            border-top: 3px solid #2563eb;
            border-bottom: none;
            padding-top: 12px;
        }

        .payment-info {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
        }

        .payment-title {
            font-size: 14px;
            font-weight: bold;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .payment-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
        }

        .payment-status.paid {
            background: #d1fae5;
            color: #065f46;
        }

        .payment-status.pending {
            background: #fef3c7;
            color: #92400e;
        }

        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #666;
        }

        .footer-links {
            margin-top: 10px;
        }

        .footer-links a {
            color: #2563eb;
            text-decoration: none;
            margin: 0 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Mein-Termin</div>
        <div class="company-info">
            Musterstraße 123 • 12345 Berlin • Deutschland<br>
            Tel: +49 30 12345678 • E-Mail: info@mein-termin.de<br>
            USt-IdNr: DE123456789
        </div>
    </div>

    <div class="invoice-header clearfix">
        <div class="invoice-title">RECHNUNG</div>
        <div class="invoice-details">
            <div class="invoice-number">{{ $invoice->invoice_number }}</div>
            <div class="details-row">
                <span class="label">Rechnungsdatum:</span> {{ $invoice->issued_at->format('d.m.Y') }}
            </div>
            @if($invoice->paid_at)
            <div class="details-row">
                <span class="label">Bezahlt am:</span> {{ $invoice->paid_at->format('d.m.Y') }}
            </div>
            @elseif($invoice->due_at)
            <div class="details-row">
                <span class="label">Fällig am:</span> {{ $invoice->due_at->format('d.m.Y') }}
            </div>
            @endif
        </div>
    </div>

    <div class="customer-info">
        <div class="customer-title">Rechnungsempfänger</div>
        <div class="customer-name">{{ $invoice->user->name }}</div>
        @if($invoice->user->email)
        <div>{{ $invoice->user->email }}</div>
        @endif
        @if($invoice->user->phone)
        <div>{{ $invoice->user->phone }}</div>
        @endif
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Beschreibung</th>
                <th>Zeitraum</th>
                <th class="text-right">Betrag</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $invoice->subscription->plan->name }} Plan</strong><br>
                    <small style="color: #666;">{{ $invoice->subscription->plan->description }}</small>
                </td>
                <td>
                    @if($invoice->subscription->starts_at && $invoice->subscription->ends_at)
                    {{ $invoice->subscription->starts_at->format('d.m.Y') }} - {{ $invoice->subscription->ends_at->format('d.m.Y') }}
                    @else
                    Monatlich
                    @endif
                </td>
                <td class="text-right">€{{ number_format($invoice->amount, 2, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-row clearfix">
            <span class="summary-row-label">Zwischensumme:</span>
            <span class="summary-row-value">€{{ number_format($invoice->amount, 2, ',', '.') }}</span>
        </div>
        <div class="summary-row clearfix">
            <span class="summary-row-label">MwSt. (19%):</span>
            <span class="summary-row-value">€{{ number_format($invoice->amount * 0.19, 2, ',', '.') }}</span>
        </div>
        <div class="summary-row total clearfix">
            <span class="summary-row-label">Gesamtbetrag:</span>
            <span class="summary-row-value">€{{ number_format($invoice->amount * 1.19, 2, ',', '.') }}</span>
        </div>
    </div>

    <div class="payment-info">
        <div class="payment-title">Zahlungsinformationen</div>
        <div style="margin-bottom: 10px;">
            <span class="label">Status:</span>
            <span class="payment-status {{ $invoice->status }}">
                @if($invoice->status === 'paid')
                    Bezahlt
                @elseif($invoice->status === 'pending')
                    Ausstehend
                @else
                    {{ ucfirst($invoice->status) }}
                @endif
            </span>
        </div>
        @if($invoice->status === 'pending')
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 5px;"><span class="label">Bankverbindung:</span></div>
            <div>IBAN: DE89 3704 0044 0532 0130 00</div>
            <div>BIC: COBADEFFXXX</div>
            <div>Verwendungszweck: {{ $invoice->invoice_number }}</div>
        </div>
        @endif
    </div>

    <div class="footer">
        <div>
            Vielen Dank für Ihr Vertrauen in Mein-Termin!<br>
            Bei Fragen zu dieser Rechnung kontaktieren Sie uns bitte.
        </div>
        <div class="footer-links">
            <a href="mailto:support@mein-termin.de">support@mein-termin.de</a> |
            <a href="tel:+493012345678">+49 30 12345678</a> |
            <a href="https://mein-termin.de">www.mein-termin.de</a>
        </div>
        <div style="margin-top: 20px; font-size: 10px; color: #999;">
            Geschäftsführer: Max Mustermann • Amtsgericht Berlin • HRB 123456<br>
            Diese Rechnung wurde elektronisch erstellt und ist ohne Unterschrift gültig.
        </div>
    </div>
</body>
</html>
