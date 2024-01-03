package Database;

import Entities.Account;
import Entities.UserPoint;
import jakarta.ejb.Singleton;
import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

import java.io.Serializable;
import java.util.List;
@Singleton
public class PointBase implements Serializable {
    private EntityManager entityManager;
    private EntityManagerFactory emfactory;

    public PointBase() {
        this.emfactory = Persistence.createEntityManagerFactory("Web4");
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
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        getPointsTable(user).forEach(entityManager::remove);
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
