package User;

public class UserValidator {
    public static boolean validateUser(String login, String password){
        String regex = "^[a-zA-Z0-9]+$";
        if (login.contains(" ") || password.contains(" ")) return false;
        if (!login.matches(regex) || !password.matches(regex)) return false;
        if (login.length( ) < 6 || password.length( ) < 6) return false;
        return true;
    }
}
