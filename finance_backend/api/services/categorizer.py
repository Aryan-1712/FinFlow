"""
Keyword-based expense categoriser and subscription detector.
"""

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "food": [
        "zomato", "swiggy", "restaurant", "cafe", "coffee", "pizza", "burger",
        "biryani", "lunch", "dinner", "breakfast", "snack", "food", "eat",
        "grocery", "bigbasket", "blinkit", "zepto", "instamart", "bakery",
        "hotel", "dhaba", "juice", "milk", "vegetables", "fruits",
    ],
    "transport": [
        "uber", "ola", "rapido", "metro", "bus", "auto", "rickshaw",
        "petrol", "diesel", "fuel", "parking", "toll", "cab", "taxi",
        "irctc", "train", "flight", "airfare", "indigo", "air india",
    ],
    "entertainment": [
        "netflix", "prime", "hotstar", "disney", "spotify", "youtube",
        "movie", "cinema", "pvr", "inox", "game", "gaming", "steam",
        "concert", "event", "show", "theatre", "entertainment",
    ],
    "utilities": [
        "electricity", "water", "gas", "internet", "broadband", "wifi",
        "jio", "airtel", "vi ", "bsnl", "recharge", "postpaid", "prepaid",
        "maintenance", "society", "rent",
    ],
    "health": [
        "hospital", "clinic", "doctor", "medicine", "pharmacy", "medical",
        "apollo", "medplus", "1mg", "netmeds", "health", "insurance",
        "gym", "fitness", "yoga", "physiotherapy",
    ],
    "shopping": [
        "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa",
        "shopping", "clothes", "shoes", "fashion", "accessories", "watch",
        "electronics", "mobile", "laptop", "gadget",
    ],
    "education": [
        "udemy", "coursera", "unacademy", "byju", "upgrad", "skill",
        "book", "course", "tuition", "coaching", "school", "college",
        "fees", "exam", "study",
    ],
    "travel": [
        "hotel", "resort", "airbnb", "oyo", "makemytrip", "yatra",
        "goibibo", "trip", "travel", "holiday", "vacation", "tourism",
        "sightseeing",
    ],
    "subscription": [
        "subscription", "membership", "annual", "monthly plan", "renewal",
        "auto-renew", "recurring",
    ],
    "investment": [
        "mutual fund", "sip", "zerodha", "groww", "upstox", "kuvera",
        "stock", "share", "equity", "nps", "ppf", "fd ", "fixed deposit",
        "gold", "crypto", "demat",
    ],
}

SUBSCRIPTION_KEYWORDS: list[str] = [
    "netflix", "prime", "hotstar", "disney", "spotify", "apple",
    "google one", "youtube premium", "microsoft 365", "adobe",
    "zoom", "slack", "notion", "dropbox", "icloud", "antivirus",
    "vpn", "github", "jira", "subscription", "membership",
    "monthly plan", "annual plan", "renewal",
]


def auto_categorise(description: str) -> str:
    """Return the best matching category for a free-text description."""
    lower = description.lower()
    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower)
        if score:
            scores[category] = score
    if not scores:
        return "other"
    return max(scores, key=lambda c: scores[c])


def detect_subscription(description: str, category: str) -> bool:
    """Heuristically decide if an expense looks like a subscription."""
    lower = description.lower()
    if category == "subscription":
        return True
    return any(kw in lower for kw in SUBSCRIPTION_KEYWORDS)
