# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'glori79e_vcard',
    'password': 'Vf5ddzDYeN2vHhGx2VUC',
    'database': 'glori79e_vcard',
    'raise_on_warnings': True,
    'autocommit': True,
    'pool_name': 'vcard_pool',
    'pool_size': 5
}

# Upload Directory Configuration
UPLOAD_CONFIG = {
    'base_dir': 'uploads',
    'max_file_size': 5 * 1024 * 1024,  # 5MB
    'allowed_extensions': ['.jpg', '.jpeg', '.png', '.gif'],
    'image_quality': 85  # JPEG compression quality
}

# API Configuration
API_CONFIG = {
    'jwt_secret': 'your-secret-key',  # Update with a secure secret key
    'token_expiry': 24 * 60 * 60,     # 24 hours in seconds
    'rate_limit': 100,                # requests per minute
    'cors_origins': ['http://localhost:8000']
}

# Error Messages
ERROR_MESSAGES = {
    'db_connection': 'Database connection error',
    'invalid_credentials': 'Invalid username or password',
    'unauthorized': 'Unauthorized access',
    'not_found': 'Resource not found',
    'invalid_request': 'Invalid request data',
    'file_too_large': 'File size exceeds maximum limit',
    'invalid_file_type': 'Invalid file type',
    'upload_failed': 'File upload failed'
}

# Success Messages
SUCCESS_MESSAGES = {
    'vcard_created': 'vCard created successfully',
    'vcard_updated': 'vCard updated successfully',
    'vcard_deleted': 'vCard deleted successfully',
    'file_uploaded': 'File uploaded successfully',
    'login_success': 'Login successful'
}
</create_file>
