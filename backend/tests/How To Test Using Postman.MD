simply import 'sokocredit_customer_api.postman_collection.json' into postman or you can do it manually below:

🔐 PREP: Get a JWT Token
Before anything, make sure you're authenticated.

URL should start with: http://127.0.0.1:5000/

POST /auth/login # e.g. http://127.0.0.1:5000/auth/login
  {
    "credential": "admin@sokocredit.com",
    "password": "password"
  }
}
Copy the returned token and include this in every request as a bearer token:

Authorization: Bearer <your_token_here>
1️⃣ Create a Customer
POST /customers/
Headers: Authorization: Bearer <token>
Body (JSON) (as lender/admin):

{
  "full_name": "Jane Wanjiku",
  "phone": "0712345678",
  "business_name": "Mama Wanjiku Groceries",
  "location": "Kariobangi",
  "documents": {
    "id_card": "local/path/to/id.jpg"
  }
  "mama_mboga_user_id": 3
}

As mama_mboga (self-registration):
{
  "full_name": "Jane Kabena",
  "phone": "0711222123",
  "business_name": "Kane's Kiosk",
  "location": "Ruaka",
  "documents": {
    "id_card": "local/path/to/id.jpg"
  }
}
✅ Expect 201 Created
🧪 Test edge case: duplicate phone

2️⃣ Get All Customers (Paginated)
GET /customers/?page=1&per_page=5&search=Jane
Headers: Authorization

✅ Expect JSON with customers, total, page, etc.
🧪 Try filters like:

has_documents=true

location=Kariobangi

business_name=Mama Wanjiku Groceries

3️⃣ Get Single Customer
GET /customers/<id>
Headers: Authorization
Example: /customers/1

✅ Expect 200 OK with full customer info
🧪 Try as unauthorized role → should get 403

4️⃣ Patch/Update Customer
PATCH /customers/<id>
Headers: Authorization
Body:
{
  "location": "Gikambura",
  "phone": "0788995544"
}
✅ Expect updated fields
🧪 Use a phone that exists → expect 409 Conflict

5️⃣ Delete Customer (Admin Only)
DELETE /customers/<id>
Headers: Authorization

✅ Expect 204 No Content
🧪 Try as lender or mama_mboga → expect 403

6️⃣ Export Customers
CSV
GET /customers/?format=csv

Excel
GET /customers/?format=excel

✅ Should trigger file download
🧪 Add filters to limit export scope

7️⃣ My Customers (for Lender)
GET /customers/my_customers
✅ Only shows customers with lender_id = user_id

8️⃣ Upload Customer Document
POST /customers/<id>/upload
Form Data:

file: (choose a file: JPG, PNG, PDF)

doc_type: id_card or business_permit

✅ Expect:
{
  "msg": "File uploaded",
  "path": "...",
  "documents": {
    "id_card": "uploads/customers/1/id_card_passport.jpg"
  }
}
🧪 Test:

Missing file

Wrong file type

Upload as unauthorized user → 403

9️⃣ OpenAPI Docs (Mini-Schema)
GET /customers/openapi
✅ JSON with route schema
(Not full Swagger, but good for internal reference)

🧪 Postman Tips
Use Environments to store {{base_url}} and {{token}}

Set Authorization type to Bearer Token with {{token}}

Set tests for status code (e.g., 201/403/409/etc.)

Use Collection Runner to test end-to-end flow