import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import java.util.List;

public class Leitor extends Usuario{
    private String planoAssinatura;
    private List<Integer> historicoLeitura;

    //Criei a classe Leitor utilizando a herança da classe Usuario (extends).
    //A classe Leitor herdou os atributos e os métodos da classe Usuario.

    //Declarei dois novos atributos:
    //planoAssinatura do tipo String, armazena o tipo de assinatura (no main, quando instaciei o objeto, atribuí o valor "Premium").
    //historicoLeitura, é uma lista de números inteiros, que armazena os IDs dos conteúdos lidos.

    public Leitor(int id, String nome, String email, String senha, LocalDate dataCadastro, String status, String planoAssinatura, List<Integer> historicoLeitura){
        super(id, nome, email, senha, dataCadastro, status);
        this.planoAssinatura = planoAssinatura;
        this.historicoLeitura = historicoLeitura;
    }

    //Criei o construtor da classe Leitor recebendo como parâmetros os atributos herdados
    //da classe Usuario (id, nome, email, senha, dataCadastro e status) e também os atributos
    //da própria classe (planoAssinatura e historicoLeitura).

    //Usei o super() para chamar o construtor da superclasse Usuario e inicializar os atributos herdados.
    //O super() tem que ser a primeira coisa a ser escrita dentro do construtor.

    //Usei o this para atribuir os valores recebidos como parâmetros aos atributos da classe Leitor.

    public void lerConteudo(int id){
        if(id > 0){
            if(historicoLeitura != null){
                historicoLeitura.add(id);
            }

            System.out.println("Lendo conteúdo de ID: " + id);
        } else {
            System.out.println("ID inválido");
        }
    }

    //Criei um metodo chamado lerConteudo que não retorna nenhum valor (void)
    //e recebe como parâmetro o Id do conteúdo que será lido.

    //Dentro do metodo, fiz uma verificação para saber se o ID é maior que 0.
    //Se for verdadeiro, o programa vai entrar no if e fazer outra verificação,
    //confirmando se historicoLeitura é diferente de null (se ela existe).

    //Se historicoLeitura existe, o ID recebido como parâmetro é adicionado na
    // lista historicoLeitura (.add()).

    //Depois, o programa vai mostrar a mensagem informando que o conteúdo do ID
    //está sendo lido.

    //Se o ID for menor ou igual a 0, o programa vai executar o else e exibir a mensagem "ID inválido"
    //para o usuário

    public void lerConteudo(int id, String planoAssinatura){
        if(id > 0 && planoAssinatura == "Premium"){
            if(historicoLeitura != null){
                historicoLeitura.add(id);
            }

            System.out.println("Lendo conteúdo de ID: " + id + ", com o Plano de Assinatura: " + planoAssinatura);
        } else {
            System.out.println("ID inválido ou Plano incompatível");
        }
    }

    //Criei outro metodo chamado lerConteudo utilizando sobrecarga de métodos,
    //pois ele tem o mesmo nome do metodo anterior, porém recebe parâmetros diferentes.

    //Esse metodo não retorna nenhum valor (void) e recebe os parâmetros id e planoAssinatura.

    //Dentro do metodo, fiz uma verificação para saber se o ID é maior que 0 e se o
    //plano de assinatura é "Premium".
    //Se as condições forem verdadeira, vai entrar dentro do if e passar por outra verificação,
    //verificando se historicoLeitura é diferente de null, ou seja, se a lista existe.

    //Se historicoLeitura existir, o ID recebido como parâmetro vai ser adicionado na lista
    //historicoLeitura (.add()).

    //Depois, é exibida uma mensagem informando que o conteúdo do ID informado está sendo lido
    //e mostrando o plano de assinatura utilizado ("Premium", pois para entrar no if, tem que ser "Premium").

    //Se o Id for menor ou igual a 0 ou o plano for diferente de "Premium", o programa
    //vai executar o else e mostrar ao usuário uma mensagem de erro informando que o ID é invalido
    //ou o plano é incompatível

    public void favoritarConteudo(int id){
        if(id > 0){
            System.out.println("Conteúdo " + id + " favoritado.");
        } else {
            System.out.println("ID inválido");
        }
    }

    //Criei um metodo chamado favoritarConteudo, que não retorna valor nenhum (void)
    //e recebe como parâmetro o ID do conteúdo que será favoritado.

    //Dentro do metodo, é feita a verificação do ID. Se o ID for maior que 0, o programa
    //entra no if e exibe a mensagem informado que o conteúdo do id recebido foi favoritado.

    //Mas se o ID for menor ou igual a 0, o programa executa o else e exibe a mensagem de id inválido
}
