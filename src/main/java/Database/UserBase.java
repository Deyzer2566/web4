package Database;

import Entities.Account;
import User.UserBuilder;

import javax.ejb.Singleton;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.io.Serializable;
import java.util.List;
import java.util.Optional;

@Singleton
public class UserBase implements Serializable {
    private EntityManager entityManager;
    private EntityManagerFactory emfactory;

    public UserBase() {
        this.emfactory = Persistence.createEntityManagerFactory("Web4");

        this.entityManager = emfactory.createEntityManager();
    }

    public void addUser(Account user) {
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        entityManager.persist(user);
        tx.commit();
    }

    private List<Account> getUsers(){
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Account> query = cb.createQuery(Account.class);
        Root<Account> c = query.from(Account.class);
        query.select(c);
        return entityManager.createQuery(query).getResultList();
    }

    public boolean isUserInBase(Account user){
        return getUsers().stream().anyMatch(x -> (x.getLogin().equals(user.getLogin())));
    }

    public Optional<Account> getUser(String login, String password){
        Account user = UserBuilder.createUser(login,password);
        return getUsers().stream().filter(x -> (x.getLogin().equals(user.getLogin())) &&
                x.getPassword().equals(user.getPassword())).findAny();
    }
}
