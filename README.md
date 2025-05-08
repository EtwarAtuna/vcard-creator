
Built by https://www.blackbox.ai

---

# vCard Creator

## Project Overview
vCard Creator is a web application that allows users to create customizable vCards (virtual business cards). Users can fill in their personal and contact information, upload a profile photo, and choose card styles. The application also provides a preview of the created vCard that can be saved directly to contacts.

## Installation
To get started with vCard Creator, clone the repository to your local machine and open the `index.html` file in a modern web browser. You can use the following command to clone the repository:

```bash
git clone <repository-url>
cd vcard-creator
```

## Usage
1. Open the `index.html` file in your favorite web browser.
2. Fill in the form with your personal information, including name, job title, company, email, phone, address, and social media links.
3. Upload a profile photo (if desired) and choose a background color for the vCard.
4. After filling in the details, click on the "Create vCard" button to generate a preview of your vCard.
5. To save your vCard to contacts, click the "Save to Contacts" button.

## Features
- User-friendly form to input personal and contact information.
- Profile photo upload with a preview.
- Customizable background color for the vCard.
- Dynamic preview of the vCard with real-time updates.
- Admin panel to manage and view created vCards (accessible via the "Admin Panel" link).

## Dependencies
This project uses the following external libraries:
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Font Awesome**: A library for icons used in the application.
- **Google Fonts**: For custom fonts (specifically, the 'Inter' font).

For more advanced JavaScript interactivity, external JavaScript files are included (`assets/js/main.js` for the main functionality and `assets/js/admin.js` for the admin interface).

## Project Structure
```
/vcard-creator
│
├── index.html        # Main HTML file for the vCard creation interface
├── admin.html        # HTML file for the admin panel
└── assets
    ├── css
    │   └── style.css # Custom CSS file for additional styling
    └── js
        ├── main.js   # JavaScript file for managing the vCard creation
        └── admin.js   # JavaScript file for managing the admin panel functionality
```

## Acknowledgements
This project utilizes various web technologies and libraries such as Tailwind CSS and Font Awesome to ensure a responsive and visually appealing design.

---

Feel free to reach out if you have any questions or feedback about the vCard Creator project!