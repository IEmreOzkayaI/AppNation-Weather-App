package appNation.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import appNation.utils.FilterError;

@RestController
@RequestMapping("/fallback")
public class FallBackController {

    @RequestMapping("/message")
    public ResponseEntity<Map<String, Object>> globalFallbackMethod() {
        Map<String, Object> errorMessage = FilterError.createServiceUnavailableErrorMessage();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorMessage);
    }

}