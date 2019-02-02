// Code generated by MockGen. DO NOT EDIT.
// Source: ./client.go

// Package mock_rest is a generated GoMock package.
package mock_rest

import (
	gomock "github.com/golang/mock/gomock"
	io "io"
	reflect "reflect"
)

// MockClient is a mock of Client interface
type MockClient struct {
	ctrl     *gomock.Controller
	recorder *MockClientMockRecorder
}

// MockClientMockRecorder is the mock recorder for MockClient
type MockClientMockRecorder struct {
	mock *MockClient
}

// NewMockClient creates a new mock instance
func NewMockClient(ctrl *gomock.Controller) *MockClient {
	mock := &MockClient{ctrl: ctrl}
	mock.recorder = &MockClientMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockClient) EXPECT() *MockClientMockRecorder {
	return m.recorder
}

// SetHeader mocks base method
func (m *MockClient) SetHeader(name, value string) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "SetHeader", name, value)
}

// SetHeader indicates an expected call of SetHeader
func (mr *MockClientMockRecorder) SetHeader(name, value interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "SetHeader", reflect.TypeOf((*MockClient)(nil).SetHeader), name, value)
}

// Get mocks base method
func (m *MockClient) Get(url string, result interface{}) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Get", url, result)
	ret0, _ := ret[0].(error)
	return ret0
}

// Get indicates an expected call of Get
func (mr *MockClientMockRecorder) Get(url, result interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Get", reflect.TypeOf((*MockClient)(nil).Get), url, result)
}

// GetRaw mocks base method
func (m *MockClient) GetRaw(url string) (io.ReadCloser, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetRaw", url)
	ret0, _ := ret[0].(io.ReadCloser)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetRaw indicates an expected call of GetRaw
func (mr *MockClientMockRecorder) GetRaw(url interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetRaw", reflect.TypeOf((*MockClient)(nil).GetRaw), url)
}

// Post mocks base method
func (m *MockClient) Post(url string, request, result interface{}) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Post", url, request, result)
	ret0, _ := ret[0].(error)
	return ret0
}

// Post indicates an expected call of Post
func (mr *MockClientMockRecorder) Post(url, request, result interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Post", reflect.TypeOf((*MockClient)(nil).Post), url, request, result)
}

// Put mocks base method
func (m *MockClient) Put(url string, request, result interface{}) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Put", url, request, result)
	ret0, _ := ret[0].(error)
	return ret0
}

// Put indicates an expected call of Put
func (mr *MockClientMockRecorder) Put(url, request, result interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Put", reflect.TypeOf((*MockClient)(nil).Put), url, request, result)
}
