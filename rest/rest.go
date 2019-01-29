package rest

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/axle-h/ddns/log"
	"io"
	"io/ioutil"
	"net/http"
)

type Client interface {
	Headers() map[string]string

	Get(url string, result interface{}) error

	GetRaw(url string) (io.ReadCloser, error)

	Post(url string, request interface{}, result interface{}) error

	Put(url string, request interface{}, result interface{}) error
}

type HttpClient struct {
	logger     log.Logger
	baseUrl    string
	headers    map[string]string
	httpClient http.Client
}

func (rest *HttpClient) Headers() map[string]string {
	return rest.headers
}

func (rest *HttpClient) Do(method string, url string, request interface{}) (io.ReadCloser, error) {
	if rest.baseUrl != "" {
		url = rest.baseUrl + url
	}

	var body io.Reader
	if request != nil {
		jsonBody, err := json.Marshal(request)
		if err != nil {
			return nil, err
		}

		if rest.logger.IsLevelEnabled(log.DebugLevel) {
			rest.logger.Debugf("%s %s %s", method, url, string(jsonBody))
		}

		body = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}

	for key, value := range rest.headers {
		req.Header.Set(key, value)
	}

	res, err := rest.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode < 200 || res.StatusCode >= 299 {
		// Check if there's a response body
		defer res.Body.Close()

		errorBody, _ := ioutil.ReadAll(res.Body)

		return nil, fmt.Errorf("failed to %s %s: %s, %s", method, url, res.Status, errorBody)
	}

	return res.Body, nil
}

func (rest *HttpClient) GetRaw(url string) (io.ReadCloser, error) {
	return rest.Do(http.MethodGet, url, nil)
}

func (rest *HttpClient) Get(url string, result interface{}) error {
	body, err := rest.GetRaw(url)
	if err != nil {
		return err
	}

	return rest.unmarshalResult(http.MethodGet, url, body, result)
}

func (rest *HttpClient) Post(url string, request interface{}, result interface{}) error {
	body, err := rest.Do(http.MethodPost, url, request)
	if err != nil {
		return err
	}

	return rest.unmarshalResult(http.MethodPost, url, body, result)
}

func (rest *HttpClient) Put(url string, request interface{}, result interface{}) error {
	body, err := rest.Do(http.MethodPut, url, request)
	if err != nil {
		return err
	}

	return rest.unmarshalResult(http.MethodPut, url, body, result)
}

func (rest *HttpClient) unmarshalResult(method string, url string, body io.ReadCloser, result interface{}) error {
	if result == nil {
		return nil
	}

	defer body.Close()

	content, err := ioutil.ReadAll(body)
	if err != nil {
		return err
	}

	if rest.logger.IsLevelEnabled(log.DebugLevel) {
		rest.logger.Debugf("%s %s -> %s", method, url, content)
	}

	return json.Unmarshal(content, result)
}
