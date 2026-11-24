package com.clothshop.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClothShopErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClothShopErpApplication.class, args);
    }
}
