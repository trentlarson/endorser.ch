import * as express from 'express'
import actionController from './action-controller'
import { UPORT_PUSH_TOKEN_HEADER } from '../services/util'
import { hideDidsAndAddLinksToNetwork, makeMeGloballyVisible } from '../services/util-higher'
import { getAllDidsRequesterCanSee } from '../services/network-cache.service'

import JwtService from '../services/jwt.service';
class JwtController {
  getIssuersMatchingClaim(req, res) {
    JwtService.allClaimAndConfirmationIssuersMatchingClaim(req.query.claimId)
      .then(result =>
            hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, {result}))
      .then(r => res.json(r))
      .catch(err => res.status(500).json(""+err).end())
  }
}
let jwtController = new JwtController();


import TenureService from '../services/tenure.service';
class TenureController {
  getAtPoint(req, res) {
    TenureService.atPoint(req.query.lat, req.query.lon)
      .then(result => hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, result))
      .then(r => res.json(r))
      .catch(err => res.status(500).json(""+err).end())
  }
  getClaimsAndConfirmationsAtPoint(req, res) {
    TenureService.getClaimsAndConfirmationsAtPoint(req.query.lat, req.query.lon)
      .then(result => hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, result))
      .then(r => res.json(r))
      .catch(err => res.status(500).json(""+err).end())
  }
}
let tenureController = new TenureController();


import OrgRoleService from '../services/org.service';
class OrgRoleController {
  getClaimsAndConfirmationsOnDate(req, res) {
    OrgRoleService.getClaimsAndConfirmationsOnDate(req.query.orgName, req.query.roleName, req.query.onDate)
      .then(result => hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, result))
      .then(r => res.json(r))
      .catch(err => res.status(500).json(""+err).end())
  }
}
let orgRoleController = new OrgRoleController();


import DbService from '../services/endorser.db.service';
class DbController {
  getVoteCounts(req, res) {
    DbService.retrieveVoteCounts()
      .then(result => hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, result))
      .then(r => res.json(r))
      .catch(err => { console.log(err); res.status(500).json(""+err).end(); })
  }
  getSeenByAll(req, res) {
    DbService.getSeenByAll()
      .then(result => hideDidsAndAddLinksToNetwork(res.locals.tokenIssuer, result))
      .then(r => res.json(r))
      .catch(err => { console.log(err); res.status(500).json(""+err).end(); })
  }
  makeMeGloballyVisible(req, res) {
    makeMeGloballyVisible(res.locals.tokenIssuer, req.body.url)
      .then(() => res.status(201).json({success:true}).end())
      .catch(err => { console.log(err); res.status(500).json(""+err).end(); })
  }
  getCanSeeDids(req, res) {
    getAllDidsRequesterCanSee(res.locals.tokenIssuer)
      .then(r => res.json(r))
      .catch(err => { console.log(err); res.status(500).json(""+err).end(); })
  }
}
let dbController = new DbController();

export default express
  .Router()
  .all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, ' + UPORT_PUSH_TOKEN_HEADER);
    next();
  })

/**
 * See /server/common/server.js for other Swagger settings & pieces of generated docs.
 **/

/**
 * Get issuers for a claim
 * @group report - Reports
 * @route GET /api/report/issuersWhoClaimedOrConfirmed
 * @param {claimId} date.query.required - the ID of the claim
 * @returns {Array.String} 200 - issuers who have claimed or confirmed same claim
 * @returns {Error} default - Unexpected error
 */
  .get('/issuersWhoClaimedOrConfirmed', jwtController.getIssuersMatchingClaim)

/**
 * Get claims and confirmations for individual
 * @group report - Reports
 * @route GET /api/report/actionClaimsAndConfirmationsSince
 * @param {datetime} date.query.optional - the date from which to show actionclaims
 * @returns {Array.ActionClaimsConfirmations} 200 - action claims with the confirmations that go along
 * @returns {Error} default - Unexpected error
 */
  .get('/actionClaimsAndConfirmationsSince', actionController.getActionClaimsAndConfirmationsSince)

/**
 * Get tenure claims for a point
 * @group report - Reports
 * @route GET /api/report/tenureClaimsAtPoint
 * @param {number} lat.query.required
 * @param {number} lon.query.required
 * @returns {Array.object} 200 - claimed tenures (up to 50)
 * @returns {Error} default - Unexpected error
 */
  .get('/tenureClaimsAtPoint', tenureController.getAtPoint)

/**
 * Get tenure claims and confirmations for a point
 * @group report - Reports
 * @route GET /api/report/tenureClaimsAndConfirmationsAtPoint
 * @param {number} lat.query.required
 * @param {number} lon.query.required
 * @returns {Array.object} 200 - claimed tenures (up to 50)
 * @returns {Error} default - Unexpected error
 */
  .get('/tenureClaimsAndConfirmationsAtPoint', tenureController.getClaimsAndConfirmationsAtPoint)

/**
 * Get org-role claims and confirmations for org & role & date
 * @group report - Reports
 * @route GET /api/report/orgRoleClaimsAndConfirmationsOnDate
 * @param {string} orgName.query.required
 * @param {string} roleName.query.required
 * @param {date} onDate.query.required
 * @returns {Array.object} 200 - claimed tenures (up to 50)
 * @returns {Error} default - Unexpected error
 */
  .get('/orgRoleClaimsAndConfirmationsOnDate', orgRoleController.getClaimsAndConfirmationsOnDate)

  .get('/voteCounts', dbController.getVoteCounts)

/**
 * Retrieve all globally-visible DIDs
 * @group claim - Reports
 * @route GET /api/report/globallyVisibleDids
 */
  .get('/globallyVisibleDids', dbController.getSeenByAll)

/**
 * Consent to make push-token issuer's ID visible to the world
 * @group claim - Reports
 * @route POST /api/report/makeMeGloballyVisible
 */
  .post('/makeMeGloballyVisible', dbController.makeMeGloballyVisible)

/**
 * Get all DIDs this person can see
 * @group report - Reports
 * @route GET /api/report/whichDidsICanSee
 * @returns {Array.object} 200 - list of DIDs user can see
 * @returns {Error}  default - Unexpected error
 */
  .get('/whichDidsICanSee', dbController.getCanSeeDids)
