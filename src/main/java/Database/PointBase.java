package Database;

import Entities.Account;
import Entities.UserPoint;

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
@Singleton
public class PointBase implements Serializable {
    private EntityManager entityManager;
    private EntityManagerFactory emfactory;

    public PointBase() {
        EntityManagerFactory emfactory = Persistence.createEntityManagerFactory("Web4");

        this.entityManager = emfactory.createEntityManager();
    }

    public List<UserPoint> getPointsTable(Account user) throws UnauthorizedException {
        if(user == null)
            throw new UnauthorizedException();
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<UserPoint> query = cb.createQuery(UserPoint.class);
        Root<UserPoint> c = query.from(UserPoint.class);
        query.select(c).where(cb.equal(c.get("owner"),user));
        return entityManager.createQuery(query).getResultList();
    }

    public void clearPoints(Account user) throws UnauthorizedException {
        if(user == null)
            throw new UnauthorizedException();
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<UserPoint> query = cb.createQuery(UserPoint.class);
        Root<UserPoint> c = query.from(UserPoint.class);
        query.where(cb.equal(c.get("owner"),user));
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        entityManager.createQuery(query).getResultList().forEach(x->entityManager.remove(x));
        tx.commit();
    }

    public void putPoint(Account user, UserPoint point) throws NullPointerException, UnauthorizedException {
        if(user == null)
            throw new UnauthorizedException();
        if(point == null)
            throw new NullPointerException();
        point.setOwner(user);
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        entityManager.persist(point);
        tx.commit();
    }
}
