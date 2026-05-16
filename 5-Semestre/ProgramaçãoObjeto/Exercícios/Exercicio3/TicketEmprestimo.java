import java.util.Date;

public class TicketEmprestimo {
    private int codigo;
    private Date dataEmprestimo;

    public TicketEmprestimo(int codigo) {
        this.codigo = codigo;
        this.dataEmprestimo = new Date(); // Data atual
    }

    public int getCodigo() {
        return codigo;
    }

    public void setCodigo(int codigo) {
        this.codigo = codigo;
    }

    public Date getDataEmprestimo() {
        return dataEmprestimo;
    }

    public void setDataEmprestimo(Date dataEmprestimo) {
        this.dataEmprestimo = dataEmprestimo;
    }
}
