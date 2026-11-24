package com.clothshop.erp.controller;

import com.clothshop.erp.model.Product;
import com.clothshop.erp.model.ProductVariant;
import com.clothshop.erp.repository.ProductRepository;
import com.clothshop.erp.repository.ProductVariantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public ProductController(ProductRepository productRepository, ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Product createProduct(@RequestBody Product product) {
        if (product.getVariants() != null) {
            for (ProductVariant v : product.getVariants()) {
                v.setProduct(product);
                if (v.getLastReceivedAt() == null) {
                    v.setLastReceivedAt(LocalDateTime.now());
                }
            }
        }
        return productRepository.save(product);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productRepository.searchProducts(query);
    }

    @GetMapping("/variants")
    public List<ProductVariant> getAllVariants() {
        return variantRepository.findAll();
    }

    @GetMapping("/variants/barcode/{barcode}")
    public ResponseEntity<ProductVariant> getVariantByBarcode(@PathVariable String barcode) {
        return variantRepository.findByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/variants/low-stock")
    public List<ProductVariant> getLowStockVariants() {
        return variantRepository.findLowStockVariants();
    }

    @GetMapping("/variants/aging")
    public List<ProductVariant> getAgingVariants(@RequestParam(defaultValue = "60") int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        return variantRepository.findAgingVariants(cutoff);
    }

    @PutMapping("/variants/{id}/stock")
    @Transactional
    public ResponseEntity<ProductVariant> updateVariantStock(@PathVariable Long id, @RequestParam Integer quantityChange) {
        return variantRepository.findById(id).map(variant -> {
            variant.setStock(Math.max(0, variant.getStock() + quantityChange));
            if (quantityChange > 0) {
                variant.setLastReceivedAt(LocalDateTime.now());
            }
            return ResponseEntity.ok(variantRepository.save(variant));
        }).orElse(ResponseEntity.notFound().build());
    }
}
