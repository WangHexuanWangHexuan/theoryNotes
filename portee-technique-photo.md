# Portée statique vs dynamique : la technique de la photo

IFT-2035, série 5. Une méthode mécanique pour trouver, sans hésiter, quelle valeur une fonction utilise pour une variable libre.

---

## 1. La règle en deux lignes

> **Statique (lexicale)** : la fonction cherche dans **sa photo**, prise au moment où le `λ` est **créé**.
> **Dynamique** : la fonction cherche dans l'environnement **du moment où elle est appelée**.

| | Où on cherche `x` | Ce qu'on regarde |
|---|---|---|
| **Statique** | dans la **photo** de la fonction | là où le `λ` est **écrit / créé** |
| **Dynamique** | dans la **pile actuelle** | **qui** a appelé la fonction, et quand |

---

## 2. La méthode, pas à pas

### Statique
1. Déroule le programme ligne par ligne et tiens à jour l'**environnement courant**.
2. Chaque fois qu'un `λ` est **évalué**, c'est-à-dire qu'une fonction est créée, prends une **photo** de l'environnement courant. La fonction devient `(code, photo)`. C'est la **fermeture**.
3. À l'appel `f(arg)`, l'environnement utilisé est **photo de f + paramètres**. On ignore complètement ce qui existe ailleurs à ce moment-là.

### Dynamique
1. Pas de photo. Une fonction, c'est **juste du code**.
2. Chaque `let` ou chaque appel **empile** des liaisons. À la fin du corps ou du retour d'appel, on les **dépile**.
3. À l'appel `f(arg)`, on cherche dans la **pile actuelle**, de haut en bas. Le premier `x` trouvé gagne.

### Trois rappels
- **Le corps d'un `let`**, c'est tout ce qui suit **son** `in`. Les corps s'emboîtent comme des poupées russes.
- **Un paramètre** se comporte exactement comme un `let` : `(λx → corps) 5` ≈ `let x = 5 in corps`.
- **Masquage** : un nouveau `x` crée un **trou**. Le nom désigne la nouvelle valeur, l'ancienne est cachée mais pas détruite.

---

## 3. Exemples résolus

### Exemple 1 : la base

```
let y = 10 in
let f = λ → y in
let y = 20 in
f()
```

**Statique**
- Création de `f` : env = `{y↦10}` → photo de `f` = `{y↦10}`.
- `let y = 20` : la photo de `f` ne change **pas**.
- `f()` : on cherche dans la photo → **10**.

**Dynamique**
- Au moment de `f()`, la pile est (haut → bas) : `y↦20, f, y↦10` → **20**.

---

### Exemple 2 : la fonction est passée **vers le bas** (en argument)

```
let z = 3 in
let show = λ → z in
let run = λf → (let z = 50 in f()) in
run show
```

**Statique**
- Photo de `show` = `{z↦3}`.
- `run show` appelle `f()`, c'est-à-dire `show()`. On cherche `z` dans la photo de `show` → **3**.
- Le `z = 50` local à `run` est invisible pour `show` : il n'est pas dans sa photo.

**Dynamique**
- Pendant `f()`, la pile est : `z↦50` (local à `run`), `f↦show`, `run`, `show`, `z↦3` → **50**.

> Attention, piège : avec la version currifiée `λf → λz → f()` appelée par `run show 50`, la dynamique donnerait une **erreur**. `run show` retourne avant que `50` soit passé, donc `f↦show` est déjà dépilé quand on exécute `f()`.

> L'appelant **change le sens** des variables de `show`. C'est exactement la « capture accidentelle » qui rend la dynamique dangereuse.

---

### Exemple 3 : la fonction **remonte** (elle survit à son créateur)

```
let make = λv → (λ → v * 2) in
let d = make 7 in
d()
```

**Statique**
- La petite fonction `λ → v * 2` est créée **pendant** `make 7` → photo = `{v↦7, make}`.
- `d()` → `7 * 2` = **14**.

**Dynamique**
- `make 7` est **terminé** quand on appelle `d()`, donc `v↦7` est **dépilé**.
- Pile = `{make, d}`, aucun `v` → **erreur : variable non liée**.

> En dynamique, **rien ne survit à la fin d'un appel**. Seule la photo (statique) garde une valeur après coup.

---

### Exemple 4 : variable qui n'existe **pas encore** à la création

```
let get = λ → w in
let w = 4 in
get()
```

**Statique**
- Photo de `get` = `{ }`, car `w` n'existe pas encore.
- `get()` → `w` introuvable dans la photo → **erreur**.

**Dynamique**
- Pile au moment de `get()` : `w↦4, get` → **4**.

> C'est le **miroir** de l'exemple 3 : ici, c'est le statique qui échoue et le dynamique qui réussit.

---

### Exemple 5 : un même créateur, **deux photos** différentes

```
let make = λv → (λ → v) in
let p = make 1 in
let q = make 2 in
p() + q()
```

**Statique**
- `make 1` crée une fonction avec la photo `{v↦1}`.
- `make 2` crée une **autre** fonction avec la photo `{v↦2}`.
- `p() + q()` = `1 + 2` = **3**.

**Dynamique**
- Les deux appels à `make` sont terminés → aucun `v` sur la pile → **erreur**.

> La photo est prise **à l'exécution**, à chaque fois que le `λ` est évalué, pas une seule fois à la lecture du texte. Un même `λ` écrit une fois peut donc produire plusieurs fermetures, chacune avec sa propre photo.

---

### Exemple 6 : profondeur 2 (fonctions imbriquées)

```
let a = 1 in
let outer = λa → λb → (λ → a + b) in
let h = outer 10 20 in
let a = 100 in
let b = 200 in
h()
```

**Statique**
- `outer 10` crée `λb → …` avec la photo `{a↦10, a↦1 (caché)}`.
- `(…) 20` crée `λ → a + b` avec la photo `{b↦20, a↦10}`.
- `h()` → `10 + 20` = **30**.

**Dynamique**
- Les appels `outer 10` et `(…) 20` sont terminés : tout est dépilé.
- Pile au moment de `h()` : `b↦200, a↦100, h, outer, a↦1` → `100 + 200` = **300**.

---

### Exemple 7 : `let` **local** dans une fonction (piège)

```
let f = λ → (let k = λ → t in
             let t = 5 in
             k()) in
let t = 1 in
f()
```

**Statique**
- Photo de `f` = `{ }`, car `t = 1` est défini **après** `f`.
- Pendant `f()` : on crée `k` dans l'environnement `photo de f` = `{ }` → photo de `k` = `{ }`.
- `let t = 5` vient **après** `k`, donc il n'est pas dans sa photo.
- `k()` → `t` introuvable → **erreur**.

**Dynamique**
- Pile au moment de `k()` : `t↦5, k, f, t↦1` → **5**.

> Le `t = 1` global n'est vu par **personne** en statique : il est écrit après `f`.

---

## 4. Tableau récapitulatif

| Ex. | Situation | Statique | Dynamique |
|---|---|---|---|
| 1 | redéfinition après la création | 10 | 20 |
| 2 | fonction passée en argument | 3 | 50 |
| 3 | fonction qui survit à son créateur | 14 | erreur |
| 4 | variable définie après la fonction | erreur | 4 |
| 5 | deux fermetures, même créateur | 3 | erreur |
| 6 | profondeur 2 | 30 | 300 |
| 7 | `let` local, ordre de définition | erreur | 5 |

**Ce qu'il faut remarquer :**
- **Statique** : le résultat ne dépend **que** de l'endroit où le `λ` est créé. On peut répondre en lisant le texte.
- **Dynamique** : le résultat dépend **de qui appelle et quand**. Il faut simuler la pile.

---

## 5. Pièges fréquents

1. **Confondre définition et appel.** Un nom de fonction apparaît deux fois : dans `let k = λ → …` (la **définition**, celle que regarde le statique) et dans `k()` (l'**appel**, celui que regarde le dynamique).
2. **Croire que statique veut dire `final`.** La portée ne dit pas si une variable peut changer. Elle dit **quel** `x` un nom désigne.
3. **Garder une liaison après la fin d'un appel en dynamique.** Faux : dès qu'un appel retourne, ses paramètres sont dépilés.
4. **Oublier que le paramètre masque l'extérieur.** Dans `λx → (λ → x)`, le `x` le plus proche est le **paramètre**, pas un `let x` plus haut.
5. **Penser que `let k = λ → b` veut dire `k = b`.** Non : le `λ` **retarde** le calcul de `b` jusqu'à l'appel `k()`. C'est justement ce retard qui crée la question de la portée.

---

## 6. Exercices (réponses cachées)

Pour chacun : résultat en **statique**, puis en **dynamique** (une valeur, ou « erreur »).

### E1 : la fonction est appelée **pendant** son créateur
```
let x = 1 in
let mk = λx → (λ → x)() in
mk 2
```
<details><summary>Réponse</summary>

- **Statique : 2.** Le `λ → x` est créé pendant `mk 2`, donc photo = `{x↦2}`.
- **Dynamique : 2.** `mk 2` est encore en cours, donc `x↦2` est en haut de la pile.

Les deux coïncident : la fonction n'a pas « voyagé ».
</details>

### E2 : chaîne d'appels sur deux niveaux
```
let r = 1 in
let a = λ → r in
let b = λr → a() in
let c = λr → b 3 in
c 2
```
<details><summary>Réponse</summary>

- **Statique : 1.** Photo de `a` = `{r↦1}`.
- **Dynamique : 3.** Pile pendant `a()` : `r↦3` (de `b`), puis `r↦2` (de `c`), puis `r↦1`. Le plus récent gagne.
</details>

### E3 : fermeture qui remonte, puis appelée dans un autre contexte
```
let s = 5 in
let f = λs → λ → s in
let g = f 6 in
let h = λs → g() in
h 7
```
<details><summary>Réponse</summary>

- **Statique : 6.** Photo de `g` = `{s↦6}`.
- **Dynamique : 7.** `f 6` est terminé. Pendant `h 7`, la pile contient `s↦7` en haut.
</details>

### E4 : erreur des deux côtés ?
```
let k = λ → u in
let mk = λu → k in
let k2 = mk 9 in
k2()
```
<details><summary>Réponse</summary>

- **Statique : erreur.** `k2` est **la même** fonction que `k`, avec la photo `{ }`. `mk` ne crée pas de nouveau `λ`, il renvoie `k` tel quel.
- **Dynamique : erreur.** Au moment de `k2()`, `mk 9` est terminé, donc `u` est dépilé.
</details>

### E5 : profondeur 2 avec masquages entrelacés (difficile)
```
let v = 1 in
let f = λv → λw → (λ → v + w) in
let g = f 10 in
let v = 100 in
let h = g 20 in
let w = 1000 in
h()
```
<details><summary>Réponse</summary>

- **Statique : 30.** `g` a la photo `{v↦10}`. `g 20` crée `λ → v + w` avec la photo `{w↦20, v↦10}`. Le `let v = 100`, bien que placé **avant** `g 20`, ne change pas la photo de `g`.
- **Dynamique : 1100.** Tous les appels sont terminés. Pile au moment de `h()` : `w↦1000, h, v↦100, g, f, v↦1` → `100 + 1000`.
</details>
