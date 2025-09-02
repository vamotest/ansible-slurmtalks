package metrics

import (
	"log"
	"os"
	"strings"
)

func SimulatedMetrics() {
	if !strings.EqualFold(os.Getenv("SIMULATED_METRICS"), "true") {
		log.Println("[WARNING] SIMULATED_METRICS disabled.")
		return
	}

}
