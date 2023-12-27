package Point;

import Entities.UserPoint;

public class PointBuilder {
    public static UserPoint createPoint(String x, String y, String r){
        return createPoint(Double.parseDouble(x), Double.parseDouble(y),Double.parseDouble(r));
    }

    public static UserPoint createPoint(double x, double y, double r){
        UserPoint userPoint = new UserPoint();
        userPoint.setX(x);
        userPoint.setY(y);
        userPoint.setR((int)r);
        userPoint.setInArea(PointValidator.checkPoint(userPoint));
        return userPoint;
    }

    public static UserPoint createPoint(long id, double x, double y, double r){
        UserPoint userPoint = createPoint(x,y,r);
        userPoint.setId(id);
        return userPoint;
    }
}
