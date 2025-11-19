flowchart LR
    A[Customer Browser] --> B[Acme Shopping Cart SPA<br/>React + TypeScript + Tailwind]

    subgraph C[Public Experience]
        B --> C1[Catalog Page<br/>Paginated List]
        B --> C2[Product Detail Page]
        B --> C3[Shopping Cart]
    end

    subgraph D[Login & Identity]
        B --> D1[Login Redirect<br/>IdentityServer<br/>OpenID Connect]
        D1 --> B
    end

    subgraph E[Authenticated Experience]
        B --> E1[Checkout Page]
        B --> E2[Profile Page]
        B --> E3[Order History Page]
        B --> E4[Order Detail Page]
    end

    subgraph F[APIs]
        F1[Catalog API<br/>Item List + Detail]
        F2[ShoppingCart API<br/>Customer + Orders]
    end
    
    C1 --> F1
    C2 --> F1
    
    E1 --> F2
    E2 --> F2
    E3 --> F2
    E4 --> F2
