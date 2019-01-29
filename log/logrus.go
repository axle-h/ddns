package log

import (
	"github.com/sirupsen/logrus"
	"os"
)

type LogrusLogger struct {
	*logrus.Logger
}

func NewLogger(verbose bool) Logger {
	logger := logrus.New()

	logger.SetOutput(os.Stdout)
	logger.SetFormatter(&logrus.TextFormatter{
		ForceColors: true,
	})

	if verbose {
		logger.SetLevel(logrus.DebugLevel)
	} else {
		logger.SetLevel(logrus.InfoLevel)
	}

	return LogrusLogger{logger}
}

func (logger LogrusLogger) IsLevelEnabled(level Level) bool {
	logrusLevel := getLogrusLevel(level)
	return logger.Logger.IsLevelEnabled(logrusLevel)
}

func getLogrusLevel(level Level) logrus.Level {
	switch level {
	case TraceLevel:
		return logrus.TraceLevel
	case DebugLevel:
		return logrus.DebugLevel
	case InfoLevel:
		return logrus.InfoLevel
	case WarnLevel:
		return logrus.WarnLevel
	case ErrorLevel:
		return logrus.ErrorLevel
	case FatalLevel:
		return logrus.FatalLevel
	case PanicLevel:
		return logrus.PanicLevel
	default:
		panic("Unknown log level " + string(level))
	}
}
