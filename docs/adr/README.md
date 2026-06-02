# 📐 ADR — Architecture Decision Records

Esta pasta contém os **registros de decisões arquiteturais** do FlowStudio AI.

## O que é um ADR?

Um **ADR (Architecture Decision Record)** é um documento curto que registra uma decisão arquitetural importante, incluindo:

- **Contexto** — por que essa decisão precisou ser tomada
- **Decisão** — o que foi decidido
- **Alternativas consideradas** — o que foi avaliado e descartado
- **Consequências** — o que se ganha e o que se perde

## Regras de ouro

1. 🔒 **ADRs são imutáveis.** Uma vez aprovados, nunca são editados.
2. 🔁 Se uma decisão muda, **cria-se um novo ADR** que "supersedes" o anterior.
3. 📅 Cada ADR é datado e numerado sequencialmente.
4. 🎯 Um ADR responde **uma decisão**, não várias.

## Por que ADRs importam

Sem ADRs, decisões arquiteturais viram **folclore oral**. Em 6 meses, ninguém lembra POR QUE algo foi feito de determinado jeito, e o time refaz a discussão do zero (ou pior: desfaz a decisão sem saber).

ADRs preservam o **histórico de pensamento arquitetural** do projeto.

---

## Índice de ADRs

| #   | Título                                       | Status      | Data       |
| --- | -------------------------------------------- | ----------- | ---------- |
| [ADR-001](./ADR-001-white-label-switch.md) | Arquitetura White-Label com Switch Master | ✅ Aprovado | 02/06/2026 |

---

## Template para novos ADRs

```markdown
# ADR-XXX: Título da decisão

> **Status:** Proposto / Aprovado / Substituído por ADR-YYY
> **Data:** DD/MM/AAAA
> **Decisores:** Nome(s)

## Contexto

Qual problema estamos resolvendo? Qual é a situação atual?

## Decisão

O que foi decidido?

## Alternativas consideradas

- **Alternativa A:** descrição + por que foi descartada
- **Alternativa B:** descrição + por que foi descartada

## Consequências

### Positivas

- ...

### Negativas / Trade-offs

- ...

## Implementação

Passos concretos (ou link pra checklist no CHECKPOINT.md).
```
