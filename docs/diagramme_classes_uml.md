# FactoryFlow — Diagramme de Classes UML

> **Ticket Jira associé :** [FA-13 - Conception du Diagramme de Classes UML](https://abiratkhadija-1788780331877.atlassian.net/browse/FA-13)  
> **Sous-tâches :** [FA-14](https://abiratkhadija-1788780331877.atlassian.net/browse/FA-14) (Modélisation des entités) & [FA-15](https://abiratkhadija-1788780331877.atlassian.net/browse/FA-15) (Relations, cardinalités & snapshot)  
> **Auteure :** Khadija Abirat  
> **Date :** 06/10/2026  

---

## 1. Vue d'ensemble du Modèle

Ce diagramme modélise l'architecture des données de **FactoryFlow** en garantissant l'application stricte des règles métier :
1. **Snapshot de Composition :** Les ordres de fabrication (`ManufacturingOrder`) conservent une copie immuable de la nomenclature (`OrderSnapshotItem`) au moment de leur création, les rendant totalement indépendants des modifications futures du produit.
2. **Cycle de Vie & Statuts :** L'état d'un ordre suit une transition stricte (`PLANIFIE` $\rightarrow$ `EN_COURS` $\rightarrow$ `TERMINE` ou `ANNULE` si planifié).
3. **Traçabilité Intégrale :** Conservation des dates (création, démarrage, fin) et des utilisateurs (Admin créateur `createdBy`, Opérateur affecté `assignedTo`, Auteur des mouvements de stock `performedBy`).
4. **Cohérence des Stocks :** Distinction des types de mouvements (`IN` / `OUT`) et association obligatoire d'une sortie à un ordre de fabrication (`orderId`).

---

## 2. Diagramme Mermaid

```mermaid
classDiagram
    direction TB

    class User {
        +ObjectId _id
        +String name
        +String email {unique}
        +String password
        +Role role
        +Date createdAt
    }

    class Role {
        <<enumeration>>
        ADMIN
        OPERATOR
    }

    class RawMaterial {
        +ObjectId _id
        +String reference {unique}
        +String name
        +String unit
        +Number availableQuantity {>= 0}
        +Number alertThreshold {>= 0}
        +Date createdAt
    }

    class Product {
        +ObjectId _id
        +String reference {unique}
        +String name
        +Date createdAt
    }

    class CompositionItem {
        +ObjectId materialId
        +Number quantity {> 0}
    }

    class ManufacturingOrder {
        +ObjectId _id
        +ObjectId productId
        +ObjectId createdBy
        +ObjectId assignedTo
        +Number targetQuantity {> 0}
        +OrderStatus status
        +Date startedAt
        +Date endedAt
        +Date createdAt
    }

    class OrderSnapshotItem {
        +ObjectId materialId
        +String reference
        +String name
        +String unit
        +Number quantityPerUnit {> 0}
    }

    class StockMovement {
        +ObjectId _id
        +ObjectId materialId
        +MovementType type
        +Number quantity {> 0}
        +String reason
        +ObjectId orderId
        +ObjectId performedBy
        +Date createdAt
    }

    class OrderStatus {
        <<enumeration>>
        PLANIFIE
        EN_COURS
        TERMINE
        ANNULE
    }

    class MovementType {
        <<enumeration>>
        IN
        OUT
    }

    User "1" ..> "1" Role : possède
    
    Product "1" *-- "1..*" CompositionItem : composition
    CompositionItem "*" --> "1" RawMaterial : référence matière
    
    ManufacturingOrder "1" *-- "1..*" OrderSnapshotItem : snapshotComposition
    OrderSnapshotItem "*" --> "1" RawMaterial : référence historique
    
    ManufacturingOrder "*" --> "1" Product : fabrique
    ManufacturingOrder "*" --> "1" User : créé par (Admin)
    ManufacturingOrder "*" --> "1" User : assigné à (Opérateur)
    
    StockMovement "*" --> "1" RawMaterial : concerne
    StockMovement "*" --> "1" User : effectué par
    StockMovement "*" --> "0..1" ManufacturingOrder : lié à (si type = OUT)
```

---

## 3. Justification des Choix de Conception

* **Composition vs Agrégation :**
  * `Product` possède une composition forte (`*--`) avec `CompositionItem` : si le produit est supprimé ou manipulé, sa composition lui est propre.
  * `ManufacturingOrder` possède une composition forte (`*--`) avec `OrderSnapshotItem` : l'ordre encapsule physiquement sa propre copie des matières requises et de leurs quantités unitaires lors de la commande.
* **Séparation `CompositionItem` et `OrderSnapshotItem` :**
  * Évite tout risque d'altération rétrospective si le prix, l'unité ou la nomenclature du produit évolue après planification de l'ordre.
* **Gestion des mouvements de stock :**
  * `orderId` est optionnel (`0..1`) car une entrée de matière première (`IN`) provient d'un réapprovisionnement externe sans ordre de fabrication associé. En revanche, les sorties (`OUT`) de fabrication sont systématiquement rattachées à un `ManufacturingOrder`.
