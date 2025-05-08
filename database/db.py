import mysql.connector
from mysql.connector import Error, pooling
from contextlib import contextmanager
from .config import DB_CONFIG, ERROR_MESSAGES

# Create a connection pool
try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name=DB_CONFIG['pool_name'],
        pool_size=DB_CONFIG['pool_size'],
        **DB_CONFIG
    )
except Error as e:
    print(f"Error creating connection pool: {e}")
    raise

@contextmanager
def get_connection():
    conn = None
    try:
        conn = connection_pool.get_connection()
        yield conn
    except Error as e:
        print(f"{ERROR_MESSAGES['db_connection']}: {e}")
        raise
    finally:
        if conn:
            conn.close()

def execute_query(query, params=None, fetchone=False, fetchall=False):
    """Execute a query and optionally return results"""
    with get_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(query, params or ())
            
            if fetchone:
                result = cursor.fetchone()
            elif fetchall:
                result = cursor.fetchall()
            else:
                result = None
                conn.commit()
            
            return result
        except Error as e:
            conn.rollback()
            raise
        finally:
            cursor.close()

# vCard Operations
def add_vcard(vcard_data):
    """Add a new vCard to the database"""
    query = """
    INSERT INTO vcards (
        user_id, full_name, job_title, company, email, phone, 
        address, website, linkedin_url, facebook_url, twitter_url, 
        photo_url, background_color, is_active
    ) VALUES (
        %(user_id)s, %(full_name)s, %(job_title)s, %(company)s, 
        %(email)s, %(phone)s, %(address)s, %(website)s,
        %(linkedin_url)s, %(facebook_url)s, %(twitter_url)s, 
        %(photo_url)s, %(background_color)s, %(is_active)s
    )
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(query, vcard_data)
            conn.commit()
            return cursor.lastrowid
        finally:
            cursor.close()

def get_vcard(vcard_id):
    """Get a vCard by ID with its tags"""
    query = """
    SELECT v.*, GROUP_CONCAT(t.name) as tags
    FROM vcards v
    LEFT JOIN vcard_tags vt ON v.id = vt.vcard_id
    LEFT JOIN tags t ON vt.tag_id = t.id
    WHERE v.id = %s
    GROUP BY v.id
    """
    return execute_query(query, (vcard_id,), fetchone=True)

def update_vcard(vcard_id, update_data):
    """Update a vCard's information"""
    allowed_fields = {
        'full_name', 'job_title', 'company', 'email', 'phone',
        'address', 'website', 'linkedin_url', 'facebook_url',
        'twitter_url', 'photo_url', 'background_color', 'is_active'
    }
    
    # Filter out any fields that aren't in allowed_fields
    update_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_data:
        return False
    
    set_clause = ", ".join(f"{k} = %({k})s" for k in update_data.keys())
    query = f"UPDATE vcards SET {set_clause} WHERE id = %(id)s"
    
    params = update_data.copy()
    params['id'] = vcard_id
    
    return execute_query(query, params)

def delete_vcard(vcard_id):
    """Delete a vCard and its associated data"""
    queries = [
        "DELETE FROM vcard_tags WHERE vcard_id = %s",
        "DELETE FROM contact_interactions WHERE vcard_id = %s",
        "DELETE FROM vcards WHERE id = %s"
    ]
    
    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            for query in queries:
                cursor.execute(query, (vcard_id,))
            conn.commit()
            return True
        except Error:
            conn.rollback()
            raise
        finally:
            cursor.close()

# Brochure Operations
def save_brochure_image(image_url, display_order=0):
    """Save a brochure image URL to the database"""
    query = """
    INSERT INTO brochure_images (image_url, display_order)
    VALUES (%s, %s)
    """
    return execute_query(query, (image_url, display_order))

def get_brochure_images():
    """Get all brochure images ordered by display_order"""
    query = "SELECT * FROM brochure_images ORDER BY display_order, created_at"
    return execute_query(query, fetchall=True)

def delete_brochure_image(image_id):
    """Delete a brochure image by ID"""
    query = "DELETE FROM brochure_images WHERE id = %s"
    return execute_query(query, (image_id,))

def update_brochure_description(description):
    """Update the company brochure description"""
    query = """
    INSERT INTO company_brochure (description) VALUES (%s)
    ON DUPLICATE KEY UPDATE description = VALUES(description)
    """
    return execute_query(query, (description,))

# Tag Operations
def get_all_tags():
    """Get all available tags"""
    query = "SELECT * FROM tags ORDER BY name"
    return execute_query(query, fetchall=True)

def add_tags_to_vcard(vcard_id, tag_ids):
    """Add multiple tags to a vCard"""
    query = "INSERT INTO vcard_tags (vcard_id, tag_id) VALUES (%s, %s)"
    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            for tag_id in tag_ids:
                cursor.execute(query, (vcard_id, tag_id))
            conn.commit()
            return True
        except Error:
            conn.rollback()
            raise
        finally:
            cursor.close()

# Statistics Operations
def get_vcard_statistics(vcard_id=None):
    """Get interaction statistics for one or all vCards"""
    query = """
    SELECT v.id, v.full_name,
           COUNT(DISTINCT CASE WHEN ci.interaction_type = 'view' THEN ci.id END) as views,
           COUNT(DISTINCT CASE WHEN ci.interaction_type = 'download' THEN ci.id END) as downloads,
           COUNT(DISTINCT CASE WHEN ci.interaction_type = 'share' THEN ci.id END) as shares
    FROM vcards v
    LEFT JOIN contact_interactions ci ON v.id = ci.vcard_id
    """
    if vcard_id:
        query += " WHERE v.id = %s"
        return execute_query(query, (vcard_id,), fetchone=True)
    else:
        query += " GROUP BY v.id"
        return execute_query(query, fetchall=True)

def log_interaction(vcard_id, interaction_type, ip_address=None, user_agent=None):
    """Log a vCard interaction (view, download, or share)"""
    query = """
    INSERT INTO contact_interactions (vcard_id, interaction_type, ip_address, user_agent)
    VALUES (%s, %s, %s, %s)
    """
    return execute_query(query, (vcard_id, interaction_type, ip_address, user_agent))
