// Copyright © 2019 Alex Haslehurst <alex.haslehurst@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

package cmd

import (
	"github.com/axle-h/ddns/ip"
	"github.com/axle-h/ddns/rest"
	"github.com/spf13/cobra"
)

// ipCmd represents the ip command
var ipCmd = &cobra.Command{
	Use:   "ip",
	Short: "Scrape public IP address",
	Long:  `Scrape public IP address from configured source.`,
	Run: func(cmd *cobra.Command, args []string) {
		scraper, err := ip.NewScraper(configFactory, logger, rest.NewFactory(logger))
		if err != nil {
			logger.Fatal(err)
		}

		ip, err := scraper.Scrape()
		if err != nil {
			logger.Fatal(err)
		}

		logger.Info("public IP address: ", ip)
	},
}

func init() {
	rootCmd.AddCommand(ipCmd)
}
