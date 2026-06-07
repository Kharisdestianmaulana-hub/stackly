<?php
$php_version = phpversion();
$doc_root = $_SERVER['DOCUMENT_ROOT'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stackly Server</title>
    <style>
        :root {
            --bg: #09090b;
            --card: #18181b;
            --border: #27272a;
            --text-primary: #f8fafc;
            --text-secondary: #a1a1aa;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text-primary);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 480px;
            padding: 2rem;
            box-sizing: border-box;
        }
        .card {
            background-color: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2.5rem;
        }
        .icon {
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }
        h1 {
            margin: 0 0 0.5rem;
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        p {
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.5;
            margin: 0 0 2rem;
        }
        .details {
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            padding: 1.5rem 0;
            margin-bottom: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        .detail-row {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .detail-label {
            color: var(--text-secondary);
            font-size: 0.85rem;
        }
        .detail-value {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.03);
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            border: 1px solid var(--border);
            font-size: 0.85rem;
            word-break: break-all;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background-color: var(--text-primary);
            color: var(--bg);
            text-decoration: none;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.95rem;
            transition: opacity 0.2s;
            box-sizing: border-box;
        }
        .btn:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
            </div>
            <h1>Stackly Server</h1>
            <p>Your local development environment is running successfully. You can place your projects in the document root below.</p>
            
            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Environment</span>
                    <span class="detail-value">Apache / PHP</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">PHP Version</span>
                    <span class="detail-value"><?php echo $php_version; ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Document Root</span>
                    <span class="detail-value"><?php echo $doc_root; ?></span>
                </div>
            </div>

            <a href="/phpinfo.php" class="btn">View PHP Info</a>
        </div>
    </div>
</body>
</html>
