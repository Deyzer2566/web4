package Token;

import Entities.Account;

import jakarta.ejb.Singleton;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;

@Singleton
public class TokenManager {
    private HashMap<String, Account> storage;
    private MessageDigest hasher;
    public TokenManager() throws NoSuchAlgorithmException {
        hasher = MessageDigest.getInstance("SHA-1");
        storage = new HashMap<>();
    }
    public String createToken(Account account) {
        hasher.reset();
        hasher.update((account.getLogin()+ LocalDateTime.now().toString()).getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hasher.digest());
    }

    public synchronized Account getAccount(String token) {
        return storage.get(token);
    }

    public String addAccount(Account account){
        String token = createToken(account);
        synchronized (storage) {
            storage.put(token, account);
        }
        new Thread(()->{
            try {
                Thread.sleep(10*60*1000);//ждем 10 минут
            } catch (InterruptedException ignored) {
            }
            synchronized (storage) {
                storage.remove(token);
            }
        }).start();
        return token;
    }
}
