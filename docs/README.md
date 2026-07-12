# Pizzeria Planeta — Strona internetowa

Nowoczesna strona internetowa dla **Pizzerii Planeta** w Elblągu z systemem zamówień online.

## Funkcje

- Nowoczesny design z animacjami (scroll reveal, hover effects, particles)
- Łatwo konfigurowalne menu w pliku JSON
- Koszyk zakupów z zapisem w przeglądarce
- Zamówienia z dostawą lub odbiorem osobistym
- Email do właściciela po złożeniu zamówienia
- Responsywny design (telefon, tablet, desktop)
- Podzielony kod na wiele małych plików

## Struktura projektu

```
pizzeria-planeta/
├── index.html              # Główna strona
├── data/
│   ├── config.json         # Dane restauracji, email, zdjęcia
│   └── menu.json           # Menu — kategorie i pozycje
├── css/
│   ├── variables.css       # Kolory, fonty, zmienne
│   ├── base.css            # Reset i podstawy
│   ├── animations.css      # Animacje CSS
│   ├── components.css      # Przyciski, formularze
│   ├── header.css          # Nagłówek
│   ├── hero.css            # Sekcja główna
│   ├── menu.css            # Karty menu
│   ├── cart.css            # Koszyk i zamówienia
│   ├── sections.css        # O nas, galeria, kontakt
│   ├── footer.css          # Stopka
│   └── main.css            # Import wszystkich stylów
├── js/
│   ├── app.js              # Główna inicjalizacja
│   ├── config.js           # Ładowanie konfiguracji
│   ├── menu.js             # Renderowanie menu
│   ├── cart.js             # Logika koszyka
│   ├── cart-ui.js          # Interfejs koszyka
│   ├── order.js            # Wysyłanie zamówień
│   ├── animations.js       # Animacje i treść strony
│   └── toast.js            # Powiadomienia
└── assets/
    └── logo.svg            # Logo pizzerii
```

## Uruchomienie lokalne

Strona wymaga lokalnego serwera (moduły ES6). Wybierz jedną z opcji:

### Python (jeśli zainstalowany)
```bash
cd pizzeria-planeta
python -m http.server 8080
```
Otwórz: http://localhost:8080

### Node.js (jeśli zainstalowany)
```bash
npx serve .
```

### VS Code / Cursor
Zainstaluj rozszerzenie "Live Server" i kliknij "Go Live".

## Konfiguracja menu

Edytuj plik `data/menu.json`:

```json
{
  "categories": [
    {
      "id": "pizza-40",
      "name": "Pizza 40 cm",
      "icon": "🍕",
      "items": [
        {
          "id": "margherita-40",
          "name": "Margherita",
          "description": "Sos pomidorowy, mozzarella...",
          "price": 32,
          "image": "https://...",
          "tags": ["klasyczna"]
        }
      ]
    }
  ]
}
```

## Konfiguracja restauracji

Edytuj plik `data/config.json` — adres, telefon, godziny otwarcia, zdjęcia, ustawienia dostawy.

### Zamiana zdjęć na własne z Google

1. Otwórz profil Google Maps pizzerii
2. Pobierz zdjęcia lub skopiuj linki
3. Wgraj na hosting (np. imgur, własny serwer) lub użyj lokalnych plików w folderze `assets/`
4. Zaktualizuj ścieżki w `config.json` i `menu.json`

## Konfiguracja email (EmailJS) — ZALECANE

Aby zamówienia automatycznie trafiały na email właściciela:

1. Załóż darmowe konto na [emailjs.com](https://www.emailjs.com)
2. Dodaj usługę email (Gmail, Outlook itp.)
3. Utwórz szablon email z polami:
   - `{{to_email}}`
   - `{{customer_name}}`, `{{customer_phone}}`, `{{customer_email}}`
   - `{{order_type}}`, `{{delivery_address}}`, `{{payment_method}}`
   - `{{order_items}}`, `{{order_subtotal}}`, `{{order_delivery}}`, `{{order_total}}`
   - `{{order_notes}}`, `{{restaurant_name}}`
4. W EmailJS ustaw odbiorcę wiadomości na adres z pola `ownerEmail` albo zostaw pustą wartość w szablonie, jeśli aplikacja ma go wypełniać dynamicznie.
5. Skopiuj **Service ID**, **Template ID** i **Public Key**.
6. Wklej je w `data/config.json`:

```json
"email": {
  "serviceId": "service_xxxxxxx",
  "templateId": "template_xxxxxxx",
  "publicKey": "twoj_public_key",
  "ownerEmail": "wlasciciel@email.pl"
}
```

### Tryb zapasowy (bez EmailJS)

Jeśli EmailJS nie jest skonfigurowany, po złożeniu zamówienia otworzy się domyślny klient email z gotową treścią zamówienia.

## Wdrożenie na serwer

Wgraj cały folder na hosting (np. Netlify, Vercel, własny serwer Apache/Nginx).

### Netlify (darmowe)
1. Przeciągnij folder na [netlify.com/drop](https://app.netlify.com/drop)
2. Strona będzie dostępna pod losowym adresem

## Kontakt pizzerii

- **Adres:** Płk. Stanisława Dąbka 140/4, 82-300 Elbląg
- **Ocena Google:** 3.9/5 (143 opinie)
