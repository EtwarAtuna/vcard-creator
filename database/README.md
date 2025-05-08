# vCard Creator Database Documentation

## Database Structure

The vCard Creator application uses a MySQL database with the following structure:

### Tables

1. **users**
   - Primary table for user accounts
   - Fields: id, email, password_hash, full_name, created_at, updated_at

2. **vcards**
   - Stores vCard information
   - Fields: id, user_id, full_name, job_title, company, email, phone, address, website, social media URLs, photo_url, background_color, is_active
   - Foreign key relationship with users table

3. **company_brochure**
   - Stores company description and brochure information
   - Fields: id, description, updated_at

4. **brochure_images**
   - Stores URLs and order of brochure images
   - Fields: id, image_url, display_order, created_at, updated_at

5. **contact_interactions**
   - Tracks vCard interactions (views, downloads, shares)
   - Fields: id, vcard_id, interaction_type, ip_address, user_agent, created_at

6. **tags**
   - Stores categories for vCards
   - Fields: id, name, created_at

7. **vcard_tags**
   - Junction table for vCard-tag relationships
   - Fields: vcard_id, tag_id

### Views

- **vcard_statistics**: Provides aggregated view/download/share statistics for each vCard

### Stored Procedures

- **get_vcard_with_tags**: Retrieves complete vCard information including associated tags

## Setup Instructions

1. Create the database and tables:
   ```bash
   mysql -u your_username -p < schema.sql
   ```

2. (Optional) Load sample data:
   ```bash
   mysql -u your_username -p < sample_data.sql
   ```

## Common Queries

### Get vCard with Tags
```sql
CALL get_vcard_with_tags(vcard_id);
```

### Get vCard Statistics
```sql
SELECT * FROM vcard_statistics WHERE id = vcard_id;
```

### Add New Tag to vCard
```sql
INSERT INTO vcard_tags (vcard_id, tag_id) VALUES (vcard_id, tag_id);
```

### Get Most Viewed vCards
```sql
SELECT 
    v.full_name,
    v.company,
    COUNT(*) as view_count
FROM vcards v
JOIN contact_interactions ci ON v.id = ci.vcard_id
WHERE ci.interaction_type = 'view'
GROUP BY v.id
ORDER BY view_count DESC
LIMIT 10;
```

## Maintenance

### Backup Database
```bash
mysqldump -u your_username -p vcard_creator > backup.sql
```

### Restore Database
```bash
mysql -u your_username -p vcard_creator < backup.sql
```

## Security Considerations

1. All passwords are stored as hashes using bcrypt
2. User input should be properly sanitized before querying
3. Use prepared statements to prevent SQL injection
4. Implement proper access control at the application level
5. Regularly backup the database
6. Monitor and log database access

## Performance Optimization

1. Indexes are created on frequently queried columns
2. Use the vcard_statistics view for quick access to interaction data
3. Implement caching at the application level for frequently accessed data
4. Regular maintenance of database statistics
5. Monitor query performance and optimize as needed

## Error Handling

1. Foreign key constraints prevent orphaned records
2. Triggers maintain updated_at timestamps
3. Transaction support for complex operations
4. Error logging and monitoring should be implemented at the application level

## Future Enhancements

1. Add support for multiple photos per vCard
2. Implement soft delete functionality
3. Add support for custom fields
4. Enhance analytics capabilities
5. Add support for team/organization management
