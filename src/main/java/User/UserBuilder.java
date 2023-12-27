package User;

import Entities.Account;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class UserBuilder{
    public static Account createUser(String login, String password) {
        Account user = new Account();
        user.setLogin(login);
        MessageDigest md = null;
        try {
            md = MessageDigest.getInstance("MD5");
            md.update(password.getBytes(StandardCharsets.UTF_8));
            user.setPassword(Base64.getEncoder().encodeToString(md.digest()));
        } catch (NoSuchAlgorithmException e) {
            user.setPassword(password);
        }
        return user;
    }
}
