package Point;

import Entities.UserPoint;

public class PointValidator {
    public static boolean validatePoint(String x, String y, String r){
        try{
            double x1 = Double.parseDouble(x);
            double y1 = Double.parseDouble(y);
            double r1 = Double.parseDouble(r);
            return x1 >= -5 && x1 <= 3 && y1 >= -3 && y1 <= 5 && r1 >= 0 && r1 <= 3;
        } catch(NullPointerException | NumberFormatException e){
            return false;
        }
    }
    public static boolean checkPoint(UserPoint userPoint){
        if(userPoint.getX() >= 0 && userPoint.getY()>=0)
            return userPoint.getR() - 2*userPoint.getX() >= userPoint.getY();
        else if(userPoint.getX() >= 0 && userPoint.getY() <= 0)
            return userPoint.getX() <= (double) userPoint.getR() /2 && userPoint.getY() >= -userPoint.getR();
        else if(userPoint.getX() <= 0 && userPoint.getY() <= 0)
            return Math.pow(userPoint.getX(),2)+Math.pow(userPoint.getY(), 2) <= Math.pow((double) userPoint.getR() /2,2);
        else return false;
    }
}
