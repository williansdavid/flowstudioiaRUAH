# ADR — Architecture Decision Records

Esta pasta contem os registros de decisoes arquiteturais do FlowStudio AI.

## O que e um ADR?

Um ADR (Architecture Decision Record) e um documento curto que registra uma
decisao arquitetural importante, incluindo:

- Contexto — por que essa decisao precisou ser tomada
- Decisao — o que foi decidido
- Alternativas consideradas — o que foi avaliado e descartado
- Consequencias — o que se ganha e o que se perde

## Regras de ouro

1. ADRs sao imutaveis. Uma vez aprovados, nunca sao editados.
2. Se uma decisao muda, cria-se um novo ADR que supersedes o anterior.
3. Cada ADR e datado e numerado sequencialmente.
4. Um ADR responde uma decisao, nao varias.

> Nota: ADRs substituidos nao sao apagados. Ficam na pasta com selo de
> "Substituido por ADR-YYY" no topo, preservando o historico de raciocinio.

## Por que ADRs importam

Sem ADRs, decisoes arquiteturais viram folclore oral. Em 6 meses, ninguem
lembra POR QUE algo foi feito de determinado jeito, e o time refaz a discussao
do zero (ou pior: desfaz a decisao sem saber).

ADRs preservam o historico de pensamento arquitetural do projeto.

---

## Indice de ADRs

- ADR-001 (./ADR-001-white-label-switch.md)
  Arquitetura White-Label com Switch Master
  Status: Substituido por ADR-002 | Data: 02/06/2026

- ADR-002 (./ADR-002-switch-simplificado.md)
  Switch White-Label Simplificado (export *)
  Status: Aprovado | Data: 05/06/2026

---

## Template para novos ADRs

    # ADR-XXX: Titulo da decisao

    > Status: Proposto / Aprovado / Substituido por ADR-YYY
    > Data: DD/MM/AAAA
    > Decisores: Nome(s)

    ## Contexto
    Qual problema estamos resolvendo? Qual e a situacao atual?

    ## Decisao
    O que foi decidido?

    ## Alternativas consideradas
    - Alternativa A: descricao + por que foi descartada
    - Alternativa B: descricao + por que foi descartada

    ## Consequencias
    ### Positivas
    - ...
    ### Negativas / Trade-offs
    - ...

    ## Implementacao
    Passos concretos (ou link pra checklist no CHECKPOINT.md).
