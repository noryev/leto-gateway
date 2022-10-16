package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// RequestLogger : Logs HTTP requests from specified routes
func RequestLogger(targetMux http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		targetMux.ServeHTTP(w, r)

		// log request by who(IP address)
		requesterIP := r.RemoteAddr

		log.Printf(
			"%s\t\t%s\t\t%s\t\t%v",
			r.Method,
			r.RequestURI,
			requesterIP,
			time.Since(start),
		)
	})
}
func errorHandler(w http.ResponseWriter, r *http.Request, status int) {
	w.WriteHeader(status)
	if status == http.StatusNotFound {
		fmt.Fprint(w, "404 Page Not Found")
	}
}

func helloWorld(w http.ResponseWriter, r *http.Request) {
	html := "Hello World!"
	if r.URL.Path != "/" {
		errorHandler(w, r, http.StatusNotFound)
		return
	}
	w.Write([]byte(html))
}
func byeWorld(w http.ResponseWriter, r *http.Request) {
	html := "Bye World!"

	if r.URL.Path != "/bye" {
		errorHandler(w, r, http.StatusNotFound)
		return
	}
	w.Write([]byte(html))
}

func main() {
	metrics := promhttp.Handler()
	mux := http.NewServeMux()
	mux.HandleFunc("/", helloWorld)
	mux.HandleFunc("/bye", byeWorld)
	mux.Handle("/metrics", metrics)
	http.ListenAndServe(":8080", RequestLogger(mux))
}

