# EcoMove

Aplicacao Node.js para incentivar a mobilidade sustentavel, desenvolvida a partir da proposta do Projeto de Extensao 1.

## Executar

```powershell
npm start
```

Abra `http://localhost:3000` no navegador.

## Usar no celular

O EcoMove tambem e um PWA: depois de publicado em uma URL com HTTPS, ele pode ser instalado no celular e funciona offline, guardando os registros no proprio aparelho.

1. Publique esta pasta em uma plataforma com HTTPS, como Vercel, Netlify ou Render.
2. Abra a URL publica no celular.
3. No Android (Chrome), abra o menu e escolha `Instalar aplicativo` ou `Adicionar a tela inicial`.
4. No iPhone (Safari), toque em Compartilhar e escolha `Adicionar a Tela de Inicio`.

Para um teste temporario na mesma rede Wi-Fi, rode `npm start` no computador e abra `http://IP-DO-COMPUTADOR:3000` no celular. Essa forma serve para testar, mas a instalacao como aplicativo exige HTTPS, por isso a publicacao e a opcao recomendada.

## Gerar APK Android

O projeto inclui a configuracao do Capacitor para Android. Depois de instalar as dependencias, use:

```powershell
pnpm install
pnpm run android:sync
pnpm run android:open
```

No Android Studio, aguarde a sincronizacao do Gradle e selecione `Build > Build APK(s)`. O APK de teste sera criado em `android/app/build/outputs/apk/debug/app-debug.apk`. Uma copia pronta para instalacao esta em `output/EcoMove-debug.apk`.

## Funcionalidades

- Diagnostico de habitos de mobilidade por questionario.
- Registro de trajetos por caminhada, bicicleta, onibus, carona e carro individual.
- Calculo de CO2 evitado em comparacao ao uso de carro individual.
- Sistema de EcoPontos e meta semanal editavel.
- Indicadores de distancia sustentavel, CO2 evitado, pontos e trajetos.
- Persistencia local dos dados em `data/ecomove.json`.

Os fatores de emissao usados pelo prototipo sao simplificados para fins educativos: carro individual (0,19 kg CO2/km), onibus (0,08 kg CO2/km) e carona (0,10 kg CO2/km). Caminhada e bicicleta sao consideradas emissao operacional zero.
