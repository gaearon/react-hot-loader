import fixupReactRouter from '../../src/fixupReactRouter';
import expect, { createSpy } from 'expect';

const forceUpdateSpy = createSpy();

const Router = {
  displayName: 'Router',
};

describe('fixupReactRouter', () => {
  beforeEach(() => {
    forceUpdateSpy.reset();
  });

  describe('when routes are passed in as children', () => {
    /* Equivalent to:
    <Router>
      <Route component={function a() {}} />
      <Route component={function b() {}} />
    </Router> */

    const props = {
      children: [
        { props: { component: function a() {} } },
        { props: { component: function b() {} } },
      ],
    };

    it('calls force update on each route\'s component', () => {
      fixupReactRouter(Router, props, forceUpdateSpy);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.children[0].props.component);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.children[1].props.component);
    });

    describe('and the top component is not a router', () => {
      it('does not call force update on any component', () => {
        const NotRouter = { displayName: 'DefinitelyNotARouter' };
        fixupReactRouter(NotRouter, props, forceUpdateSpy);
        expect(forceUpdateSpy).toNotHaveBeenCalled();
      });
    });
  });

  describe('when routes are passed in as children of children', () => {
    /* Equivalent to:
    <Router>
      <Route component={function a() {}}>
        <Route component={function b() {}} />
      </Route>
    </Router> */

    const props = {
      children: {
        props: {
          component: function a() {},
          children: {
            props: { component: function b() {} },
          },
        },
      }
    };

    it('calls force update on each route\'s component', () => {
      fixupReactRouter(props, forceUpdateSpy);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.children.props.component);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.children.props.children.props.component);
    });
  });

  describe('when routes are passed in using the `routes` prop', () => {
    const props = {
      routes: [
        { component: function a() {} },
        { component: function b() {} },
      ],
    };

    it('calls force update on each route\'s components', () => {
      fixupReactRouter(Router, props, forceUpdateSpy);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.routes[0].component);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.routes[1].component);
    });
  });

  describe('when routes are passed in using the `routes` and `childRoutes` props', () => {
    const props = {
      routes: [
        {
          component: function a() {},
          childRoutes: [
            { component: function b() {} },
          ],
        },
      ],
    };

    it('calls force update on each route\'s components', () => {
      fixupReactRouter(Router, props, forceUpdateSpy);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.routes[0].component);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.routes[0].childRoutes[0].component);
    });
  });

  describe('when there are multiple components on one route', () => {
    const props = {
      routes: [
        {
          components: {
            a: function a() {},
            b: function b() {},
          },
        },
      ],
    };

    it('calls force update on each component', () => {
      fixupReactRouter(Router, props, forceUpdateSpy);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.routes[0].components.a);
      expect(forceUpdateSpy).toHaveBeenCalledWith(props.routes[0].components.b);
    });
  });
});
