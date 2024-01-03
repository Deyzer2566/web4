package REST;

import Database.PointBase;
import Database.UnauthorizedException;
import Database.UserBase;
import Entities.Account;
import Entities.UserPoint;
import Point.PointBuilder;
import Point.PointValidator;
import Token.TokenManager;
import jakarta.ejb.EJB;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.util.*;

@Path("/point")
public class PointManager {

    @EJB
    UserBase userBase;
    @EJB
    PointBase pointBase;
    @EJB
    TokenManager tokenManager;

    @POST
    @Path("/put")
    public Response putPoint (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) throws Exception {
        Response.Status status = Response.Status.OK;
        try {
            String x = params.get("x");
            String y = params.get("y");
            String r = params.get("r");
            String token = params.get("token");
            Account account = tokenManager.getAccount(token);
            if(account == null)
                return Response.status(Response.Status.UNAUTHORIZED).build();
            try {
                if (!PointValidator.validatePoint(x, y, r))
                    return Response
                            .status(Response.Status.BAD_REQUEST)
                            .build();
                else
                    pointBase.putPoint(account, PointBuilder.createPoint(x, y, r));
            } catch(UnauthorizedException e){
                return Response
                        .status(Response.Status.UNAUTHORIZED)
                        .build();
            } catch(NullPointerException e) {
                return Response
                        .status(Response.Status.BAD_REQUEST)
                        .build();
            }
        } catch (NullPointerException e) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .build();
        }

        return Response
                .status(status)
                .build( );
    }
    @POST
    @Path("/get")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPoints (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) throws IOException {
        String token = params.get("token");
        Account account = tokenManager.getAccount(token);
        if(account == null)
            return Response.status(Response.Status.UNAUTHORIZED).build();
        List<UserPoint> pointList;
        try{
            pointList = pointBase.getPointsTable(account);
        } catch (UnauthorizedException e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        pointList = pointList.stream().map(x-> PointBuilder.createPoint(x.getId(),
                                                            x.getX(),
                                                            x.getY(),
                                                            x.getR())).toList();
        return Response
                .status(Response.Status.OK)
                .entity(pointList)
                .build();
    }

    @POST
    @Path("/clear")
    public Response clearPoints (Map<String, String> params, @Context HttpServletRequest request, @Context HttpServletResponse response) throws IOException {
        String token = params.get("token");
        Account account = tokenManager.getAccount(token);
        if(account == null)
            return Response.status(Response.Status.UNAUTHORIZED).build();
        try{
            pointBase.clearPoints(account);
        } catch (UnauthorizedException e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        return Response
                .status(Response.Status.OK)
                .build();
    }
}
