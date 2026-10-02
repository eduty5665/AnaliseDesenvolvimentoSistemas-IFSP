import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { brl, buscarFacetas, buscarVinhos, definirServidor, obterServidor, type Categoria, type Vinho } from './api'
import { Garrafa } from './Garrafa'

const C = {
  vinho900: '#2a0a14',
  vinho800: '#3d0f1e',
  vinho600: '#7b1e3a',
  vinho50: '#fbf3f5',
  ouro: '#c9a227',
  creme: '#f8f4ef',
  tinta: '#1f1a1c',
  tinta2: '#6b6166',
  borda: '#eadfe2',
  verde: '#1f7a4d',
  ambar: '#9a6700',
  vermelho: '#b3261e',
}

const ORDENS = [
  { valor: '', rotulo: 'Relevância' },
  { valor: 'preco', rotulo: 'Menor preço' },
  { valor: 'preco_desc', rotulo: 'Maior preço' },
  { valor: 'pontuacao', rotulo: 'Pontuação' },
]

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Catalogo />
    </SafeAreaProvider>
  )
}

function Catalogo() {
  const [vinhos, setVinhos] = useState<Vinho[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [selecionado, setSelecionado] = useState<Vinho | null>(null)
  const [servidor, setServidor] = useState(obterServidor())

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [pagina, facetas] = await Promise.all([buscarVinhos({ busca, categoriaId, ordem }), buscarFacetas()])
      setVinhos(pagina.itens)
      setCategorias(facetas.categorias)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [busca, categoriaId, ordem])

  useEffect(() => {
    const t = setTimeout(carregar, busca ? 350 : 0)
    return () => clearTimeout(t)
  }, [carregar, busca])

  return (
    <SafeAreaView style={s.tela} edges={['top']}>
      <View style={s.topo}>
        <Text style={s.marca}>Vino Bebidas</Text>
        <Text style={s.subMarca}>CATÁLOGO DE VINHOS ESPECIAIS</Text>
        <TextInput
          style={s.busca}
          placeholder="Buscar vinho, uva, país, produtor..."
          placeholderTextColor="#b9a7ad"
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips} contentContainerStyle={s.chipsConteudo}>
        <Chip ativo={categoriaId == null} onPress={() => setCategoriaId(null)} texto="Todos" />
        {categorias.map((c) => (
          <Chip key={c.id} ativo={categoriaId === c.id} onPress={() => setCategoriaId(c.id)} texto={c.nome} cor={c.cor} />
        ))}
        <View style={s.separador} />
        {ORDENS.map((o) => (
          <Chip key={o.valor} ativo={ordem === o.valor} onPress={() => setOrdem(o.valor)} texto={o.rotulo} discreto />
        ))}
      </ScrollView>

      {erro ? (
        <View style={s.erroCaixa}>
          <Text style={s.erroTitulo}>Não foi possível carregar o catálogo</Text>
          <Text style={s.erroTexto}>{erro}</Text>
          <Text style={s.rotulo}>Endereço do servidor (API)</Text>
          <TextInput
            style={s.campo}
            value={servidor}
            onChangeText={setServidor}
            placeholder="http://192.168.0.10:5080"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Pressable style={s.botao} onPress={() => { definirServidor(servidor); void carregar() }}>
            <Text style={s.botaoTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vinhos}
          keyExtractor={(v) => String(v.id)}
          numColumns={2}
          columnWrapperStyle={s.linha}
          contentContainerStyle={s.lista}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={C.vinho600} />}
          ListEmptyComponent={
            carregando ? <ActivityIndicator color={C.vinho600} style={{ marginTop: 40 }} /> : <Text style={s.vazio}>Nenhum vinho encontrado.</Text>
          }
          ListHeaderComponent={vinhos.length ? <Text style={s.contagem}>{vinhos.length} rótulos</Text> : null}
          renderItem={({ item }) => <Cartao vinho={item} onPress={() => setSelecionado(item)} />}
        />
      )}

      <Detalhe vinho={selecionado} fechar={() => setSelecionado(null)} />
    </SafeAreaView>
  )
}

function Chip({ texto, ativo, onPress, cor, discreto }: { texto: string; ativo: boolean; onPress: () => void; cor?: string; discreto?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, discreto && s.chipDiscreto, ativo && s.chipAtivo]}>
      {cor ? <View style={[s.bolinha, { backgroundColor: cor }]} /> : null}
      <Text style={[s.chipTexto, ativo && s.chipTextoAtivo]}>{texto}</Text>
    </Pressable>
  )
}

function Disponibilidade({ n }: { n: number }) {
  const [cor, texto] = n <= 0 ? [C.vermelho, 'Esgotado'] : n < 6 ? [C.ambar, `Últimas ${n}`] : [C.verde, 'Em estoque']
  return <Text style={[s.disp, { color: cor }]}>{texto}</Text>
}

function Cartao({ vinho, onPress }: { vinho: Vinho; onPress: () => void }) {
  const promo = vinho.precoPromocional != null && vinho.precoPromocional < vinho.precoVenda
  return (
    <Pressable style={({ pressed }) => [s.cartao, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <View style={s.cartaoImagem}>
        <Garrafa cor={vinho.corCategoria} categoria={vinho.categoria} altura={130} />
        {vinho.pontuacao ? <Text style={s.pontos}>★ {vinho.pontuacao}</Text> : null}
      </View>
      <Text style={s.categoria}>{vinho.categoria.toUpperCase()} · {vinho.pais}</Text>
      <Text style={s.nome} numberOfLines={2}>{vinho.nome}</Text>
      {promo ? <Text style={s.riscado}>{brl(vinho.precoVenda)}</Text> : null}
      <Text style={s.preco}>{brl(vinho.precoAtual)}</Text>
      <Disponibilidade n={vinho.disponivel} />
    </Pressable>
  )
}

function Detalhe({ vinho, fechar }: { vinho: Vinho | null; fechar: () => void }) {
  if (!vinho) return null
  const ficha: [string, string | null | undefined][] = [
    ['Produtor', vinho.produtor],
    ['Origem', [vinho.regiao, vinho.pais].filter(Boolean).join(', ')],
    ['Uva', vinho.uva],
    ['Safra', vinho.safra ? String(vinho.safra) : 'Não safrado'],
    ['Teor alcoólico', vinho.teorAlcoolico ? `${vinho.teorAlcoolico}%` : null],
    ['Volume', `${vinho.volumeMl} ml`],
    ['Serviço', vinho.temperaturaServico],
    ['Harmonização', vinho.harmonizacao],
    ['Código', vinho.sku],
  ]
  const compartilhar = () =>
    Share.share({
      message: `${vinho.nome} (${vinho.categoria}, ${vinho.pais}) por ${brl(vinho.precoAtual)} na Vino Bebidas.\n${obterServidor()}/vinhos/${vinho.id}`,
    })

  return (
    <Modal visible animationType="slide" onRequestClose={fechar} presentationStyle="pageSheet">
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.creme }} edges={['top', 'bottom']}>
          <View style={s.detalheTopo}>
            <Pressable onPress={fechar} hitSlop={12}><Text style={s.voltar}>‹ Catálogo</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={s.detalheImagem}>
              <Garrafa cor={vinho.corCategoria} categoria={vinho.categoria} altura={260} />
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={s.categoria}>{vinho.categoria.toUpperCase()}{vinho.pontuacao ? `  ·  ★ ${vinho.pontuacao} pontos` : ''}</Text>
              <Text style={s.detalheNome}>{vinho.nome}</Text>
              <View style={s.precoLinha}>
                <Text style={s.detalhePreco}>{brl(vinho.precoAtual)}</Text>
                <Disponibilidade n={vinho.disponivel} />
              </View>
              {vinho.descricao ? <Text style={s.descricao}>{vinho.descricao}</Text> : null}
              <View style={s.ficha}>
                {ficha.filter(([, v]) => v).map(([k, v]) => (
                  <View key={k} style={s.fichaLinha}>
                    <Text style={s.fichaChave}>{k}</Text>
                    <Text style={s.fichaValor}>{v}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={s.botao} onPress={compartilhar}>
                <Text style={s.botaoTexto}>Compartilhar com o cliente</Text>
              </Pressable>
              <Text style={s.aviso}>Para comprar ou reservar, acesse a loja online. Venda proibida para menores de 18 anos.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  )
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: C.creme },
  topo: { backgroundColor: C.vinho900, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  marca: { color: '#fff', fontSize: 26, fontWeight: '700', fontFamily: 'serif' },
  subMarca: { color: C.ouro, fontSize: 10, letterSpacing: 2, marginTop: 2, marginBottom: 12, fontWeight: '600' },
  busca: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.tinta },
  chips: { flexGrow: 0, backgroundColor: C.creme },
  chipsConteudo: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, borderWidth: 1, borderColor: C.borda, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 7 },
  chipDiscreto: { backgroundColor: 'transparent' },
  chipAtivo: { backgroundColor: C.vinho600, borderColor: C.vinho600 },
  chipTexto: { fontSize: 13, color: C.tinta },
  chipTextoAtivo: { color: '#fff', fontWeight: '600' },
  bolinha: { width: 8, height: 8, borderRadius: 4 },
  separador: { width: 1, height: 20, backgroundColor: C.borda, marginHorizontal: 4 },
  lista: { paddingHorizontal: 12, paddingBottom: 32 },
  linha: { gap: 12 },
  contagem: { color: C.tinta2, fontSize: 12, marginBottom: 8, marginLeft: 4 },
  cartao: { flex: 1, backgroundColor: '#fffdfa', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.borda },
  cartaoImagem: { alignItems: 'center', backgroundColor: C.vinho50, borderRadius: 12, paddingVertical: 10, marginBottom: 10 },
  pontos: { position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: '700', color: C.vinho600, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  categoria: { fontSize: 10, fontWeight: '700', color: '#9e2a4b', letterSpacing: 0.8 },
  nome: { fontSize: 15, fontWeight: '700', color: C.tinta, marginTop: 3, minHeight: 38, fontFamily: 'serif' },
  riscado: { fontSize: 11, color: C.tinta2, textDecorationLine: 'line-through', marginTop: 4 },
  preco: { fontSize: 17, fontWeight: '800', color: C.vinho800, marginTop: 2 },
  disp: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  vazio: { textAlign: 'center', color: C.tinta2, marginTop: 40 },
  erroCaixa: { margin: 16, padding: 18, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: C.borda },
  erroTitulo: { fontSize: 16, fontWeight: '700', color: C.vinho800 },
  erroTexto: { color: C.tinta2, marginTop: 4, marginBottom: 16 },
  rotulo: { fontSize: 11, fontWeight: '700', color: C.tinta2, marginBottom: 6, letterSpacing: 0.5 },
  campo: { borderWidth: 1, borderColor: C.borda, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 12, color: C.tinta },
  botao: { backgroundColor: C.vinho600, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  detalheTopo: { paddingHorizontal: 16, paddingVertical: 12 },
  voltar: { color: C.vinho600, fontSize: 16, fontWeight: '600' },
  detalheImagem: { alignItems: 'center', backgroundColor: C.vinho50, marginHorizontal: 16, borderRadius: 20, paddingVertical: 20, marginBottom: 16 },
  detalheNome: { fontSize: 28, fontWeight: '700', color: C.vinho800, marginTop: 6, fontFamily: 'serif' },
  precoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  detalhePreco: { fontSize: 26, fontWeight: '800', color: C.vinho800 },
  descricao: { fontSize: 15, lineHeight: 22, color: C.tinta, marginTop: 14 },
  ficha: { marginTop: 18, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.borda, marginBottom: 12 },
  fichaLinha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f3ecee' },
  fichaChave: { color: C.tinta2, fontSize: 13 },
  fichaValor: { color: C.tinta, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  aviso: { fontSize: 11, color: C.tinta2, textAlign: 'center', marginTop: 14 },
})
