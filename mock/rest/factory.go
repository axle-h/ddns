// Code generated by MockGen. DO NOT EDIT.
// Source: ./factory.go

// Package mock_rest is a generated GoMock package.
package mock_rest

import (
	rest "github.com/axle-h/ddns/rest"
	gomock "github.com/golang/mock/gomock"
	reflect "reflect"
)

// MockFactory is a mock of Factory interface
type MockFactory struct {
	ctrl     *gomock.Controller
	recorder *MockFactoryMockRecorder
}

// MockFactoryMockRecorder is the mock recorder for MockFactory
type MockFactoryMockRecorder struct {
	mock *MockFactory
}

// NewMockFactory creates a new mock instance
func NewMockFactory(ctrl *gomock.Controller) *MockFactory {
	mock := &MockFactory{ctrl: ctrl}
	mock.recorder = &MockFactoryMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockFactory) EXPECT() *MockFactoryMockRecorder {
	return m.recorder
}

// Get mocks base method
func (m *MockFactory) Get(baseUrl string) rest.Client {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Get", baseUrl)
	ret0, _ := ret[0].(rest.Client)
	return ret0
}

// Get indicates an expected call of Get
func (mr *MockFactoryMockRecorder) Get(baseUrl interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Get", reflect.TypeOf((*MockFactory)(nil).Get), baseUrl)
}
