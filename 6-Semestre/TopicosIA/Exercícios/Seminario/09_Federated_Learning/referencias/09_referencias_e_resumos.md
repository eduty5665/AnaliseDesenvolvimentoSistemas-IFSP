# Referências e resumos – Federated Learning para Privacidade

Cada referência traz o tipo de fonte e um resumo do que foi aproveitado no documento. As marcadas como “Página web consultada nesta pesquisa” foram abertas em 17/11/2026 para conferir datas e números recentes.

## 1. McMAHAN, H. B. et al. Communication-Efficient Learning of Deep Networks from Decentralized Data. In: AISTATS, 2017.

**Tipo:** Artigo científico (referência clássica)  
**Link:** https://arxiv.org/abs/1602.05629

**Resumo:** Introduz o termo federated learning e o algoritmo FedAvg, que faz cada cliente treinar várias iterações localmente antes da média. Mostra redução grande na comunicação em relação ao treino distribuído tradicional.

## 2. GOOGLE RESEARCH. Federated Learning: Collaborative Machine Learning without Centralized Training Data. Blog, abr. 2017.

**Tipo:** Artigo técnico  
**Link:** https://research.google/blog/federated-learning-collaborative-machine-learning-without-centralized-training-data/

**Resumo:** Apresenta o uso de aprendizado federado no teclado Gboard: o celular treina com o que a pessoa digita e envia só uma atualização resumida, combinada com agregação segura.

## 3. KAIROUZ, P. et al. Advances and Open Problems in Federated Learning. Foundations and Trends in Machine Learning, v. 14, n. 1–2, 2021.

**Tipo:** Artigo científico (referência clássica)  
**Link:** https://arxiv.org/abs/1912.04977

**Resumo:** Revisão abrangente da área, com cenários cross-device e cross-silo, eficiência, privacidade, robustez a ataques, justiça e problemas em aberto.

## 4. DAYAN, I. et al. Federated learning for predicting clinical outcomes in patients with COVID-19. Nature Medicine, v. 27, p. 1735–1743, 2021.

**Tipo:** Artigo científico  
**Link:** https://doi.org/10.1038/s41591-021-01506-3

**Resumo:** Estudo EXAM: modelo treinado de forma federada com dados de 20 instituições para prever necessidade de oxigênio, com desempenho melhor que modelos de cada instituição isolada.

## 5. BEUTEL, D. J. et al. Flower: A Friendly Federated Learning Research Framework. 2020.

**Tipo:** Artigo científico  
**Link:** https://arxiv.org/abs/2007.14390

**Resumo:** Apresenta o Flower, framework aberto que funciona com diferentes bibliotecas de ML e permite simular e implantar aprendizado federado em dispositivos reais.

## 6. ZHU, L.; LIU, Z.; HAN, S. Deep Leakage from Gradients. In: NeurIPS, 2019.

**Tipo:** Artigo científico (referência clássica)  
**Link:** https://arxiv.org/abs/1906.08935

**Resumo:** Mostra que é possível reconstruir imagens e textos de treino a partir dos gradientes compartilhados, evidenciando que o aprendizado federado precisa de proteções adicionais.

## 7. NOZE. Federated learning in healthcare: Flower, FATE, OpenFL.

**Tipo:** Página web consultada nesta pesquisa  
**Link:** https://www.noze.it/en/insights/federated-learning-healthcare-flower-fate/

**Resumo:** Panorama dos frameworks abertos de aprendizado federado usados em saúde (Flower, FATE, OpenFL, PySyft, TensorFlow Federated) e do paradoxo de que a IA médica precisa de dados multicêntricos que não podem ser compartilhados.

## 8. BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD).

**Tipo:** Lei brasileira  
**Link:** https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

**Resumo:** Define dados pessoais e sensíveis (incluindo saúde), bases legais para tratamento e princípios como finalidade e minimização. É o contexto legal que motiva o aprendizado federado no Brasil.

## 9. MarcT0K. Federated learning protocol.png. Wikimedia Commons. Licença CC BY 4.0.

**Tipo:** Imagem  
**Link:** https://commons.wikimedia.org/wiki/File:Federated_learning_protocol.png

**Resumo:** Imagem com licença aberta usada no documento (Figura 1) e no slide 3: Protocolo de aprendizado federado: os dispositivos treinam localmente e só os modelos vão ao servidor.
