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
	"fmt"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/log"
	"github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"os"
)

var cfgFile string
var verbose bool
var logger log.Logger
var configFactory config.Factory

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "ddns",
	Short: "Custom dynamic DNS",
	Long:  `Scrape IP address from router and push to online service.`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initLogging)
	cobra.OnInitialize(initConfig)

	persistentFlags := rootCmd.PersistentFlags()
	persistentFlags.StringVar(&cfgFile, "config", "", "config file (default is $HOME/.ddns.yaml)")
	persistentFlags.BoolVarP(&verbose, "verbose", "v", false, "increases verbosity")
}

func initLogging() {
	logger = log.NewLogger(verbose)
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	v := viper.New()

	if cfgFile != "" {
		// Use config file from the flag.
		v.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		if err != nil {
			logger.Error(err)
			os.Exit(1)
		}

		// Search config in home directory with name ".ddns" (without extension).
		v.AddConfigPath(home)
		v.SetConfigName(".ddns")
	}

	v.AutomaticEnv() // read in environment variables that match

	if err := v.ReadInConfig(); err != nil {
		logger.Debug("could not load configuration file")
		return
	}

	// If a config file is found, read it in.
	logger.Debug("using config file: ", v.ConfigFileUsed())

	configFactory = config.New(logger, v)
}
