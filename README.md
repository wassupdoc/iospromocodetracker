## 🎯 What This Does  
This script automates the process of distributing **Apple App Store promo codes** via **Google Sheets** and **Apps Script**.  

### ✅ Features  
✅ **Users get the next available promo code** and are redirected to the App Store.  
✅ **Automatically marks codes as "Redeemed"** in Google Sheets.  
✅ **Sends an email notification** to the developer when all codes are used.  
✅ **Detects when new codes are added** and resets automatically.  
✅ **Redirects users to a custom site when all codes are used up.**  
✅ QR Code Generation: Displays a QR code linking to the App Store with the promo code.
✅ Expiration Date Tracking: Adds a new column to track when a promo code was uploaded and expires after 28 days.

---

## 🛠️ **How It Works**
1️⃣ A user accesses the **web app link**.  
2️⃣ The script **fetches the next available code**, marks it as "Redeemed," and redirects the user to **Apple’s promo code redemption page**.  
3️⃣ Once **all codes are used**, the developer gets an **email notification**.  
4️⃣ If the developer **adds more codes**, the system **resets automatically** and notifies them again when the new batch is used up.  

---

## 📌 **Step-by-Step Guide**  

### **1️⃣ Set Up Your Google Sheet**  
1.	Column A: Promo Code
2.	Column B: Status (Blank = Available, “Redeemed” = Used)
3.	Column C: Upload Date (Date the code was added)
4.	Column D: Expiration Date (Automatically set to 28 days after upload)
5.	Cell E1: "Notified" (Used to track if an email was sent when codes run out)

---

### **2️⃣ Add the Google Apps Script**  
- Open your Google Sheet and go to **Extensions → Apps Script**.  
- Delete any existing code and **paste the script**:  


3️⃣ Configure the Script
	•	Replace "https://your-redirect-site.com" with your desired site to send users to after all codes are redeemed.

4️⃣ Deploy as a Web App
	1.	Click Deploy → New Deployment.
	2.	Choose Web app as the deployment type.
	3.	Set Who has access to Anyone.
	4.	Click Deploy, authorize the script, and copy the generated URL.

5️⃣ Share the Link
	•	Give users the copied URL.
	•	When accessed:
	•	If a promo code is available, the user is redirected to the App Store redemption page.
	•	If all codes are redeemed, they see a message and are redirected to your chosen site.

🛠 How It Handles New Codes
	•	If you add more codes, the system automatically resets.
	•	The "Notified" flag in C1 is removed so you can receive a new notification when all new codes are used.
	•	No manual resets needed! 🎉

🎯 Why This is Awesome
	•	Almost Fully Automated: You only need to add codes!
	•	No Manual Work: The system keeps track of everything for you.
	•	Works Forever: Keeps resetting itself when new codes are added.

🔄 Deploy it once, and it runs on autopilot! 🚀.
