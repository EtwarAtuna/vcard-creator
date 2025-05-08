import os
import json
from http.server import SimpleHTTPRequestHandler
import socketserver
from urllib.parse import parse_qs, urlparse
import mimetypes
from database.db import (
    get_vcard,
    add_vcard,
    update_vcard,
    delete_vcard,
    execute_query
)

# Ensure upload directories exist
UPLOAD_DIR = 'uploads'
PROFILE_UPLOAD_DIR = os.path.join(UPLOAD_DIR, 'profiles')
BROCHURE_UPLOAD_DIR = os.path.join(UPLOAD_DIR, 'brochure')

for directory in [UPLOAD_DIR, PROFILE_UPLOAD_DIR, BROCHURE_UPLOAD_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

class RequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        # API endpoints
        if parsed_url.path.startswith('/api/'):
            self.handle_api_get(parsed_url.path)
            return

        # Serve static files
        try:
            super().do_GET()
        except Exception as e:
            self.send_error(500, str(e))

    def do_POST(self):
        parsed_url = urlparse(self.path)
        
        # Handle file uploads
        if parsed_url.path == '/upload':
            self.handle_file_upload()
            return
            
        # Handle API endpoints
        if parsed_url.path.startswith('/api/'):
            self.handle_api_post()
            return

        self.send_error(404, "Not Found")

    def handle_api_get(self, path):
        try:
            if path == '/api/vcards':
                # Get all vCards
                vcards = execute_query("SELECT * FROM vcards", fetchall=True)
                self.send_json_response(vcards)
            
            elif path.startswith('/api/vcard/'):
                # Get specific vCard
                vcard_id = int(path.split('/')[-1])
                vcard = get_vcard(vcard_id)
                if vcard:
                    self.send_json_response(vcard)
                else:
                    self.send_error(404, "vCard not found")
            
            elif path == '/api/brochure':
                # Get brochure data
                brochure = execute_query("""
                    SELECT b.description, GROUP_CONCAT(bi.image_url) as images
                    FROM company_brochure b
                    LEFT JOIN brochure_images bi ON 1=1
                    GROUP BY b.id
                    LIMIT 1
                """, fetchone=True)
                self.send_json_response(brochure)
            
            else:
                self.send_error(404, "API endpoint not found")
                
        except Exception as e:
            self.send_error(500, str(e))

    def handle_api_post(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if self.path == '/api/vcard':
                # Create new vCard
                vcard_id = add_vcard(data)
                self.send_json_response({"id": vcard_id, "message": "vCard created successfully"})
            
            elif self.path.startswith('/api/vcard/'):
                # Update existing vCard
                vcard_id = int(self.path.split('/')[-1])
                update_vcard(vcard_id, data)
                self.send_json_response({"message": "vCard updated successfully"})
            
            elif self.path == '/api/brochure':
                # Update brochure description
                execute_query(
                    "UPDATE company_brochure SET description = %s WHERE id = 1",
                    (data.get('description'),)
                )
                self.send_json_response({"message": "Brochure updated successfully"})
            
            else:
                self.send_error(404, "API endpoint not found")
                
        except Exception as e:
            self.send_error(500, str(e))

    def handle_file_upload(self):
        try:
            # Get content type and boundary from headers
            content_type = self.headers['Content-Type']
            if not content_type.startswith('multipart/form-data'):
                self.send_error(400, "Expected multipart/form-data")
                return

            # Read and parse the multipart form data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Extract file type (profiles or brochure)
            upload_type = parse_qs(urlparse(self.path).query).get('type', [''])[0]
            upload_dir = PROFILE_UPLOAD_DIR if upload_type == 'profiles' else BROCHURE_UPLOAD_DIR
            
            # Save file and get the URL
            filename = f"{os.urandom(8).hex()}.jpg"  # Simple unique filename
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, 'wb') as f:
                f.write(post_data)
            
            # If it's a brochure image, save to database
            if upload_type == 'brochure':
                execute_query(
                    "INSERT INTO brochure_images (image_url) VALUES (%s)",
                    (f"/uploads/brochure/{filename}",)
                )
            
            # Return the URL
            self.send_json_response({
                "success": True,
                "url": f"/uploads/{upload_type}/{filename}"
            })
            
        except Exception as e:
            self.send_error(500, str(e))

    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def run_server(port=8000):
    with socketserver.TCPServer(("", port), RequestHandler) as httpd:
        print(f"Serving at port {port}")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
