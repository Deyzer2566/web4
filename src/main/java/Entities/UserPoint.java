package Entities;

import Entities.Account;

import javax.persistence.*;

@Entity
@Table
public class UserPoint {
    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE)
    private long id;

    private double x;
    private double y;

    private int r;
    private boolean inArea;
    @ManyToOne
    @JoinColumn(name = "ownerId")
    private Account owner;
    public UserPoint(){
        x=0.0;
        y=0.0;
        r=1;
    }

    public boolean isInArea() {
        return inArea;
    }
    public void setInArea(boolean inArea) {
        this.inArea = inArea;
    }

    public Account getOwner() {
        return owner;
    }

    public void setOwner(Account owner) {
        this.owner = owner;
    }
    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public int getR() {
        return r;
    }

    public void setR(int r) {
        this.r = r;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
}
