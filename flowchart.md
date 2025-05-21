```mermaid flowchart TD
    A[דף כניסה<br>index.html] --> B{סוג משתמש}
    B -- רגיל --> C[דף ראשי<br>dashboard.html]
    B -- foodgod --> D[דף ניהול<br>management.html]
    C --> E[הוספת טרנזקציה<br>add-transaction.html]
    C --> F[צפייה בטרנזקציות<br>view-transactions.html]
    C --> G[טרנזקציות שנדחו<br>view-rejected.html]
    D --> H[טרנזקציות מאושרות<br>view-all-approved.html]
    D --> I[טרנזקציות שנדחו<br>view-rejected.html]
    D --> J[כל המשתמשים<br>view-all-users.html]