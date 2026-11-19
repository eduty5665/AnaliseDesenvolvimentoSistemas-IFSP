# Referências e resumos – Segurança em Modelos Generativos

Cada referência traz o tipo de fonte e um resumo do que foi aproveitado no documento. As marcadas como “Página web consultada nesta pesquisa” foram abertas em 17/11/2026 para conferir datas e números recentes.

## 1. OWASP FOUNDATION. OWASP Top 10 for LLM Applications 2025. Versão 2025, 18 nov. 2024.

**Tipo:** Guia técnico  
**Link:** https://genai.owasp.org/llm-top-10/

**Resumo:** Lista dos dez riscos mais críticos em aplicações com LLM, com descrição, exemplos de cenários de ataque e estratégias de mitigação. A injeção de prompt aparece em primeiro lugar.

## 2. INVICTI. OWASP Top 10 risks for LLMs (2025 update). 21 set. 2025.

**Tipo:** Página web consultada nesta pesquisa  
**Link:** https://invicti.com/blog/web-security/owasp-top-10-risks-llm-security-2025

**Resumo:** Resume a edição 2025 e o que mudou: injeção de prompt segue em primeiro lugar; entram autonomia excessiva, vazamento do prompt de sistema, fraquezas em embeddings, desinformação e consumo ilimitado.

## 3. PEREZ, F.; RIBEIRO, I. Ignore Previous Prompt: Attack Techniques For Language Models. In: NeurIPS ML Safety Workshop, 2022.

**Tipo:** Artigo científico (referência clássica)  
**Link:** https://arxiv.org/abs/2211.09527

**Resumo:** Primeiro estudo sistemático de injeção de prompt contra o GPT-3, com ataques de sequestro de objetivo e de vazamento do prompt. Mostra que frases simples bastam para desviar o comportamento.

## 4. GRESHAKE, K. et al. Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection. In: ACM AISec, 2023.

**Tipo:** Artigo científico (referência clássica)  
**Link:** https://arxiv.org/abs/2302.12173

**Resumo:** Define a injeção indireta de prompt: instruções inseridas em conteúdo que o sistema recupera, como páginas e e-mails. Demonstra riscos de roubo de dados e manipulação em aplicações reais.

## 5. ZOU, A. et al. Universal and Transferable Adversarial Attacks on Aligned Language Models. 2023.

**Tipo:** Artigo científico  
**Link:** https://arxiv.org/abs/2307.15043

**Resumo:** Mostra que sufixos de texto gerados por otimização podem contornar o treinamento de segurança de vários modelos ao mesmo tempo, evidenciando a fragilidade das salvaguardas.

## 6. NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY. Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile. NIST AI 600-1, jul. 2024.

**Tipo:** Guia oficial  
**Link:** https://doi.org/10.6028/NIST.AI.600-1

**Resumo:** Lista riscos específicos da IA generativa (como confabulação, privacidade de dados, segurança da informação e conteúdo nocivo) e ações sugeridas para gerenciá-los ao longo do ciclo de vida.

## 7. GOODFELLOW, I.; SHLENS, J.; SZEGEDY, C. Explaining and Harnessing Adversarial Examples. In: ICLR, 2015.

**Tipo:** Artigo científico (referência clássica)  
**Link:** https://arxiv.org/abs/1412.6572

**Resumo:** Explica por que redes neurais são vulneráveis a perturbações pequenas e propõe o FGSM. Base histórica da segurança de modelos de aprendizado profundo.

## 8. OWASP GenAi Security Project, Provided as a download for general use from their website branding page,. OWASP GenAI Security Project Logo.png. Wikimedia Commons. Licença CC BY-SA 4.0.

**Tipo:** Imagem  
**Link:** https://commons.wikimedia.org/wiki/File:OWASP_GenAI_Security_Project_Logo.png

**Resumo:** Imagem com licença aberta usada no documento (Figura 1) e no slide 3: Logotipo do OWASP GenAI Security Project, responsável pelo Top 10 de riscos para aplicações com LLM.
