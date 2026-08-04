<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #1f2937; }
        h1 { font-size: 18px; margin-bottom: 2px; }
        .meta { color: #6b7280; margin-bottom: 16px; }
        h2 { font-size: 13px; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        td, th { padding: 4px 8px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        th { background: #f9fafb; }
        .val { text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Dashboard HSE — Ringkasan</h1>
    <p class="meta">Periode: {{ $periodLabel }} &middot; Dibuat: {{ $generatedAt }}</p>

    @if(($stats['scope'] ?? null) === 'employee')
        <h2>Ringkasan Saya</h2>
        <table>
            @foreach($stats['totals'] as $key => $value)
                <tr><td>{{ $key }}</td><td class="val">{{ $value }}</td></tr>
            @endforeach
        </table>
    @else
        <h2>Total</h2>
        <table>
            @foreach($stats['totals'] as $key => $value)
                <tr><td>{{ $key }}</td><td class="val">{{ $value }}</td></tr>
            @endforeach
        </table>

        <h2>Incident by Severity</h2>
        <table>
            @foreach($stats['incidentsBySeverity'] as $key => $value)
                <tr><td>{{ $key }}</td><td class="val">{{ $value }}</td></tr>
            @endforeach
        </table>

        <h2>PTW Status</h2>
        <table>
            @foreach((array) $stats['ptwStatus'] as $key => $value)
                <tr><td>{{ $key }}</td><td class="val">{{ $value }}</td></tr>
            @endforeach
        </table>

        <h2>Training Compliance</h2>
        <table>
            <tr><td>Completed</td><td class="val">{{ $stats['trainingCompliance']['completed'] }}</td></tr>
            <tr><td>Total</td><td class="val">{{ $stats['trainingCompliance']['total'] }}</td></tr>
            <tr><td>Percent</td><td class="val">{{ $stats['trainingCompliance']['percent'] }}%</td></tr>
        </table>
    @endif
</body>
</html>
