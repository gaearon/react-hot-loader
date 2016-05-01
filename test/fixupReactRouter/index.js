import React from 'react';
import { isReactRouterish, extractRouteHandlerComponents } from '../../src/fixupReactRouter';
import expect, { createSpy } from 'expect';

const spy = createSpy();

function Router() {}
function Route() {};
function IndexRoute() {};
function Redirect() {};
function NotRouter() {};

describe('isReactRouterish', () => {
  describe('when given a router', () => {
    it('is true when given a router', () => {
      expect(isReactRouterish(Router)).toBe(true);
    });
  });

  describe('when not given a router', () => {
    it('returns false', () => {
      expect(isReactRouterish(NotRouter)).toBe(false);
    });
  });
});

describe('extractRouteHandlerComponents', () => {
  it('handles something that is not a React Router', () => {
    const element = (
      <NotRouter />
    );
    expect(
      extractRouteHandlerComponents(element.props)
    ).toEqual([]);
  });

  describe('when routes are passed as React elements in "children" prop', () => {
    it('handles no routes', () => {
      const element = (
        <Router />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([]);
    });

    it('handles a single route', () => {
      function a() {}
      const element = (
        <Router>
          <Route component={a} />
        </Router>
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a]);
    });

    it('handles a single note with multiple components', () => {
      function a() {}
      function b() {}
      function c() {}
      const element = (
        <Router>
          <Route components={{ a, b, c }} />
        </Router>
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b, c]);
    });

    it('handles multiple routes', () => {
      function a() {}
      function b() {}
      const element = (
        <Router>
          <Route component={a} />
          <Route component={b} />
        </Router>
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b]);
    });

    it('handles deep routes of different types', () => {
      function a() {}
      function b() {}
      function c() {}
      function d() {}
      function e() {}
      function f() {}
      function g() {}
      function h() {}
      const element = (
        <Router>
          <Route component={a}>
            <Route components={{b, c}} />
            <Route component={d}>
              <IndexRoute components={{e, f}} />
              <Route component={g} />
            </Route>
          </Route>
          <Redirect />
          <IndexRoute component={h} />
        </Router>
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b, c, d, e, f, g, h]);
    });

    it('ignores broken routes', () => {
      function a() {}
      function b() {}
      const element = (
        <Router>
          <Route component={a} components={42}>
            <Route component={null} />
            <Route components={{ a: 42, b: null }} />
            <Route>
              <NotRouter />
              <Route component={b} />
            </Route>
            {null}
          </Route>
        </Router>
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b]);
    });
  });

  describe('when routes are passed as React elements in "routes" prop', () => {
    it('handles a single route', () => {
      function a() {}
      const element = (
        <Router routes={
          <Route component={a} />
        } />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a]);
    });

    it('handles a single note with multiple components', () => {
      function a() {}
      function b() {}
      function c() {}
      const element = (
        <Router routes={
          <Route components={{ a, b, c }} />
        } />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b, c]);
    });

    it('handles multiple routes', () => {
      function a() {}
      function b() {}
      const element = (
        <Router routes={[
          <Route component={a} />,
          <Route component={b} />
        ]} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b]);
    });

    it('handles deep routes of different types', () => {
      function a() {}
      function b() {}
      function c() {}
      function d() {}
      function e() {}
      function f() {}
      function g() {}
      function h() {}
      const element = (
        <Router routes={[
          <Route component={a}>
            <Route components={{b, c}} />
            <Route component={d}>
              <IndexRoute components={{e, f}} />
              <Route component={g} />
            </Route>
          </Route>,
          <Redirect />,
          <IndexRoute component={h} />
        ]} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b, c, d, e, f, g, h]);
    });

    it('ignores broken routes', () => {
      function a() {}
      function b() {}
      const element = (
        <Router routes={
          <Route component={a} components={42}>
            <Route component={null} />
            <Route components={{ a: 42, b: null }} />
            <Route>
              <NotRouter />
              <Route component={b} />
            </Route>
            {null}
          </Route>
        } />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b]);
    });
  });

  describe('when routes are passed as plain objects in "routes" prop', () => {
    it('handles a single route', () => {
      function a() {}
      const element = (
        <Router routes={{
          component: a
        }} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a]);
    });

    it('handles a single note with multiple components', () => {
      function a() {}
      function b() {}
      function c() {}
      const element = (
        <Router routes={{
          components: { a, b, c }
        }} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b, c]);
    });

    it('handles multiple routes', () => {
      function a() {}
      function b() {}
      const element = (
        <Router routes={[
          { component: a },
          { component: b }
        ]} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b]);
    });

    it('handles deep routes of different types', () => {
      function a() {}
      function b() {}
      function c() {}
      function d() {}
      function e() {}
      function f() {}
      function g() {}
      const element = (
        <Router routes={[
          { component: a },
          { components: { b, c } },
          {
            component: d,
            indexRoute: {
              components: { e, f }
            },
            childRoutes: [{
              component: g
            }]
          }
        ]} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b, c, d, e, f, g]);
    });

    it('ignores broken routes', () => {
      function a() {}
      function b() {}
      const element = (
        <Router routes={{
          component: a,
          components: 42,
          childRoutes: [{
            component: null
          }, {
            components: { a: 42, b: null },
            childRoutes: {}
          }, {
            childRoutes: [{
              something: 'else'
            }, {
              component: b
            }]
          }, null]
        }} />
      );
      expect(
        extractRouteHandlerComponents(element.props)
      ).toEqual([a, b]);
    });
  });
});
