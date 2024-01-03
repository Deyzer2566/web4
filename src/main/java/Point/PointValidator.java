package Point;

import Entities.UserPoint;

public class PointValidator {
    public static void validatePoint(String x, String y, String r) throws BadXException, BadYException, BadRException{
        double x1,y1,r1;
        try {
            x1 = Double.parseDouble(x);
            assert x1 >= -5 && x1 <= 3;
        } catch(NullPointerException | NumberFormatException | AssertionError e) {
            throw new BadXException();
        }
        try{
            y1 = Double.parseDouble(y);
            assert y1 >= -3 && y1 <= 5;
        } catch(NullPointerException | NumberFormatException | AssertionError e) {
            throw new BadYException();
        }
        try{
            r1 = Double.parseDouble(r);
            assert r1 >= 0 && r1 <= 3;
        } catch(NullPointerException | NumberFormatException | AssertionError e) {
            throw new BadRException();
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
