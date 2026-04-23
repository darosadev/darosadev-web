import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.mjs': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.eot': 'application/vnd.ms-fontobject',
	'.webp': 'image/webp',
	'.map': 'application/json'
};

const STATIC_DIR = path.join(__dirname, 'build');

function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
	const urlPath = new URL(req.url || '/', 'http://localhost').pathname;
	let filePath = path.join(STATIC_DIR, urlPath === '/' ? 'index.html' : urlPath);

	// Security: prevent directory traversal
	if (!filePath.startsWith(STATIC_DIR)) {
		res.statusCode = 403;
		res.setHeader('Content-Type', 'text/plain');
		res.end('Forbidden');
		return;
	}

	function tryServe(targetPath, fallbackToIndex = true) {
		fs.stat(targetPath, (err, stats) => {
			if (!err && stats.isFile()) {
				res.statusCode = 200;
				res.setHeader('Content-Type', getMimeType(targetPath));
				if (targetPath.includes('/immutable/')) {
					res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
				}
				const stream = fs.createReadStream(targetPath);
				stream.pipe(res);
				return;
			}

			if (fallbackToIndex) {
				// Try .html extension (e.g., /post → /post.html)
				if (!path.extname(targetPath)) {
					tryServe(targetPath + '.html', false);
					return;
				}

				// Fall back to index.html for SPA routes
				const indexPath = path.join(STATIC_DIR, 'index.html');
				fs.readFile(indexPath, (err2, data) => {
					if (err2) {
						res.statusCode = 404;
						res.setHeader('Content-Type', 'text/plain');
						res.end('Not Found');
						return;
					}
					res.statusCode = 200;
					res.setHeader('Content-Type', 'text/html');
					res.end(data);
				});
			} else {
				res.statusCode = 404;
				res.setHeader('Content-Type', 'text/plain');
				res.end('Not Found');
			}
		});
	}

	tryServe(filePath);
});

server.listen(3000, '0.0.0.0', () => {
	console.log('Server is running on http://0.0.0.0:3000/');
});
