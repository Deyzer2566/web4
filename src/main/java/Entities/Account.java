package Entities;

import javax.persistence.*;

@Entity
@Table
public class Account implements Comparable<Account>{
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE)
    private long id;

    private String login;
    private String password;
    public Account(){
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public int compareTo(Account o) {
        if(o.getId() == getId() && o.getLogin().equals(getLogin()) && o.getPassword().equals(getPassword()))
            return 0;
        return getId() > o.getId()?1:-1;
    }
}
